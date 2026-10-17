import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { NotificationType } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { ScraperService } from "../scraper/scraper.service"
import { TelegramService } from "../telegram/telegram.service"

@Injectable()
export class PriceTrackingService {
  private readonly logger = new Logger(PriceTrackingService.name)

  constructor(
    private prisma: PrismaService,
    private scraper: ScraperService,
    private config: ConfigService,
    private telegramService: TelegramService,
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

    const priceHistories: Array<{ itemId: string; price: number; currency: string }> = []
    const itemUpdates: Array<{ id: string; currentPrice: number; currency: string }> = []
    const notifications: Array<{ userId: string; type: NotificationType; title: string; message: string; relatedItemId: string }> = []
    const telegramAlerts: Array<{ userId: string; title: string; previous: number; price: number; currency: string; url?: string | null }> = []

    for (const item of items) {
      if (!item.url) continue

      try {
        const scraped = await this.scraper.scrape(item.url)
        if (scraped.price == null) continue

        const previous = item.currentPrice ? Number(item.currentPrice) : null
        const currency = scraped.currency || item.currency

        priceHistories.push({
          itemId: item.id,
          price: scraped.price,
          currency,
        })

        itemUpdates.push({
          id: item.id,
          currentPrice: scraped.price,
          currency,
        })

        if (previous != null && scraped.price < previous) {
          const drop = (previous - scraped.price).toFixed(2)
          const notifyUserIds = new Set<string>([item.wishlist.userId])
          for (const sub of item.wishlist.subscriptions) {
            if (sub.notifyNewItems) notifyUserIds.add(sub.userId)
          }

          for (const userId of notifyUserIds) {
            notifications.push({
              userId,
              type: NotificationType.PRICE_DROP,
              title: "Price drop",
              message: `"${item.title}" dropped to ${scraped.price} ${currency} (was ${previous} ${currency}, −${drop})`,
              relatedItemId: item.id,
            })
            telegramAlerts.push({
              userId,
              title: item.title,
              previous,
              price: scraped.price,
              currency,
              url: item.url,
            })
          }
        }
      } catch (error) {
        this.logger.warn(`Price track failed for item ${item.id}: ${(error as Error).message}`)
      }
    }

    if (priceHistories.length > 0) {
      await this.prisma.priceHistory.createMany({ data: priceHistories })
    }

    if (itemUpdates.length > 0) {
      await this.prisma.$transaction(
        itemUpdates.map((u) =>
          this.prisma.item.update({
            where: { id: u.id },
            data: { currentPrice: u.currentPrice, currency: u.currency },
          }),
        ),
      )
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications })
    }

    for (const alert of telegramAlerts) {
      await this.telegramService.notifyPriceDrop(
        alert.userId,
        alert.title,
        alert.previous,
        alert.price,
        alert.currency,
        alert.url,
      )
    }
  }
}
