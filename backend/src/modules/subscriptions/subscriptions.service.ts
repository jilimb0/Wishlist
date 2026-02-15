import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Privacy, SubscriptionStatus } from "@prisma/client"
import type { PrismaService } from "../../prisma/prisma.service"
import type { CreateSubscriptionDto } from "./dto/subscription.dto"

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async subscribe(wishlistId: string, userId: string, dto: CreateSubscriptionDto) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
    })

    if (!wishlist) throw new NotFoundException("Wishlist not found")

    // Cannot subscribe to own wishlists
    if (wishlist.userId === userId) {
      throw new ForbiddenException("Cannot subscribe to your own wishlist")
    }

    // Cannot subscribe to private wishlists
    if (wishlist.privacy === Privacy.PRIVATE) {
      throw new ForbiddenException("This wishlist is private")
    }

    // Check if already subscribed
    const existing = await this.prisma.subscription.findUnique({
      where: { userId_wishlistId: { userId, wishlistId } },
    })

    if (existing) throw new ConflictException("Already subscribed")

    // For FRIENDS wishlists, set status to PENDING (unless it's PUBLIC which is auto-approved)
    const status =
      wishlist.privacy === Privacy.FRIENDS
        ? SubscriptionStatus.PENDING
        : SubscriptionStatus.APPROVED

    return this.prisma.subscription.create({
      data: {
        userId,
        wishlistId,
        status,
        notifyNewItems: dto.notifyNewItems ?? true,
      },
      include: {
        wishlist: {
          select: {
            id: true,
            title: true,
            emoji: true,
            user: { select: { id: true, displayName: true } },
          },
        },
      },
    })
  }

  async unsubscribe(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) throw new NotFoundException("Subscription not found")
    if (subscription.userId !== userId) {
      throw new ForbiddenException("Not your subscription")
    }

    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    })

    return { success: true }
  }

  async getMySubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        wishlist: {
          select: {
            id: true,
            title: true,
            emoji: true,
            description: true,
            _count: { select: { items: true } },
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async getPendingRequests(userId: string) {
    return this.prisma.subscription.findMany({
      where: {
        wishlist: { userId },
        status: SubscriptionStatus.PENDING,
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        wishlist: { select: { id: true, title: true, emoji: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async updateStatus(subscriptionId: string, ownerId: string, status: SubscriptionStatus) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { wishlist: { select: { userId: true } } },
    })

    if (!subscription) throw new NotFoundException("Subscription not found")
    if (subscription.wishlist.userId !== ownerId) {
      throw new ForbiddenException("Not your wishlist")
    }

    if (status === SubscriptionStatus.APPROVED) {
      return this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status },
      })
    }

    // Rejecting means deleting the request
    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    })
    return { success: true }
  }
}
