import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { AffiliateService } from "../affiliate/affiliate.service"
import { CreateItemDto, UpdateItemDto } from "./dto/item.dto"

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private affiliateService: AffiliateService,
  ) {}

  async addToWishlist(wishlistId: string, userId: string, dto: CreateItemDto) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: {
        subscriptions: {
          select: { userId: true, notifyNewItems: true },
        },
      },
    })

    if (!wishlist) throw new NotFoundException("Wishlist not found")
    if (wishlist.userId !== userId) throw new ForbiddenException("Not your wishlist")

    if (!dto.title && !dto.url) {
      throw new BadRequestException("Either title or URL is required")
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    const userCurrency = user?.currency || "USD"

    const item = await this.prisma.item.create({
      data: {
        wishlistId,
        title: dto.title || dto.url || "Untitled Item",
        description: dto.description,
        status: dto.status || "ACTIVE",
        url: dto.url || "",
        imageUrl: dto.imageUrl,
        currentPrice: dto.price,
        currency: userCurrency,
        trackPrice: dto.trackPrice ?? false,
        isGroupGift: dto.isGroupGift ?? false,
        targetAmount: dto.targetAmount,
        fundraiserNote: dto.fundraiserNote,
        fundraiserPaymentLink: dto.fundraiserPaymentLink,
      },
    })

    // Record initial price if provided
    if (dto.price) {
      await this.prisma.priceHistory.create({
        data: {
          itemId: item.id,
          price: dto.price,
          currency: userCurrency,
        },
      })
    }

    // Notify subscribers about new item
    const subscribersToNotify = wishlist.subscriptions.filter((s) => s.notifyNewItems)
    if (subscribersToNotify.length > 0) {
      await this.prisma.notification.createMany({
        data: subscribersToNotify.map((sub) => ({
          userId: sub.userId,
          type: "NEW_ITEM" as const,
          title: "New Item Added",
          message: `"${item.title}" was added to "${wishlist.title}"`,
          relatedItemId: item.id,
        })),
      })
    }

    // Serialize Decimal → number
    return {
      ...item,
      currentPrice: item.currentPrice ? Number(item.currentPrice) : null,
      targetAmount: item.targetAmount ? Number(item.targetAmount) : null,
      affiliateUrl: item.url ? this.affiliateService.getAffiliateUrl(item.url) : null,
      totalContributed: 0,
      contributionCount: 0,
    }
  }

  async update(itemId: string, userId: string, dto: UpdateItemDto) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { wishlist: { select: { userId: true } } },
    })

    if (!item) throw new NotFoundException("Item not found")
    if (item.wishlist.userId !== userId) throw new ForbiddenException("Not your item")

    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    const updated = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        url: dto.url,
        imageUrl: dto.imageUrl,
        currentPrice: dto.price,
        currency: user?.currency,
        priority: dto.priority,
        trackPrice: dto.trackPrice,
        isGroupGift: dto.isGroupGift,
        targetAmount: dto.targetAmount,
        fundraiserNote: dto.fundraiserNote,
        fundraiserPaymentLink: dto.fundraiserPaymentLink,
      },
      include: {
        contributions: true,
      },
    })

    const contributions = updated.contributions || []
    const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      ...updated,
      currentPrice: updated.currentPrice ? Number(updated.currentPrice) : null,
      targetAmount: updated.targetAmount ? Number(updated.targetAmount) : null,
      affiliateUrl: updated.url ? this.affiliateService.getAffiliateUrl(updated.url) : null,
      totalContributed,
      contributionCount: contributions.length,
    }
  }

  async delete(itemId: string, userId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { wishlist: { select: { userId: true } } },
    })

    if (!item) throw new NotFoundException("Item not found")
    if (item.wishlist.userId !== userId) throw new ForbiddenException("Not your item")

    await this.prisma.item.delete({ where: { id: itemId } })
    return { success: true }
  }

  async getPriceHistory(itemId: string) {
    const item = await this.prisma.item.findUnique({ where: { id: itemId } })
    if (!item) throw new NotFoundException("Item not found")

    const history = await this.prisma.priceHistory.findMany({
      where: { itemId },
      orderBy: { checkedAt: "desc" },
    })

    // Serialize Decimal → number
    return history.map((h) => ({
      ...h,
      price: Number(h.price),
    }))
  }
}
