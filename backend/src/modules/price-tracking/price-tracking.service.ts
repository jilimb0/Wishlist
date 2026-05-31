import { Injectable, Logger } from "@nestjs/common"
// biome-ignore lint/style/useImportType: DI requirement
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { NotificationType } from "@prisma/client"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"
// biome-ignore lint/style/useImportType: DI requirement
import { ScraperService } from "../scraper/scraper.service"

@Injectable()
export class PriceTrackingService {
  private readonly logger = new Logger(PriceTrackingService.name)

  constructor(
    private prisma: PrismaService,
    private scraper: ScraperService,
    private config: ConfigService,
  ) {}

  @Cron("0 */6 * * *")
  async trackPrices(): Promise<void> {
    if (!this.config.get<boolean>("priceTracking.enabled")) return

    const items = await this.prisma.item.findMany({
      where: { trackPrice: true, status: "ACTIVE" },
      include: {
        wishlist: {
          select: {
            id: true,
            title: true,
            userId: true,
            subscriptions: { select: { userId: true, notifyNewItems: true } },
          },
        },
      },
    })

    this.logger.log(`Price tracking: checking ${items.length} items`)

    for (const item of items) {
      if (!item.url) continue

      try {
        const scraped = await this.scraper.scrape(item.url)
        if (scraped.price == null) continue

        const previous = item.currentPrice ? Number(item.currentPrice) : null
        const currency = scraped.currency || item.currency

        await this.prisma.priceHistory.create({
          data: {
            itemId: item.id,
            price: scraped.price,
            currency,
          },
        })

        await this.prisma.item.update({
          where: { id: item.id },
          data: { currentPrice: scraped.price, currency },
        })

        if (previous != null && scraped.price < previous) {
          const drop = (previous - scraped.price).toFixed(2)
          const notifyUserIds = new Set<string>([item.wishlist.userId])
          for (const sub of item.wishlist.subscriptions) {
            if (sub.notifyNewItems) notifyUserIds.add(sub.userId)
          }

          await this.prisma.notification.createMany({
            data: [...notifyUserIds].map((userId) => ({
              userId,
              type: NotificationType.PRICE_DROP,
              title: "Price drop",
              message: `"${item.title}" dropped to ${scraped.price} ${currency} (was ${previous} ${currency}, −${drop})`,
              relatedItemId: item.id,
            })),
          })
        }
      } catch (error) {
        this.logger.warn(`Price track failed for item ${item.id}: ${(error as Error).message}`)
      }
    }
  }
}
