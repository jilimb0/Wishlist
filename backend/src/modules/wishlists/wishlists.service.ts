import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import { Privacy, type SubscriptionStatus } from "@prisma/client"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"
// biome-ignore lint/style/useImportType: DI requirement
import { FriendsService } from "../friends/friends.service"
// biome-ignore lint/style/useImportType: validation requirement
import { CreateWishlistDto, UpdateWishlistDto } from "./dto/wishlist.dto"

@Injectable()
export class WishlistsService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService,
  ) {}

  async getMyWishlists(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true } },
        items: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async create(userId: string, dto: CreateWishlistDto) {
    return this.prisma.wishlist.create({
      data: {
        ...dto,
        userId,
      },
    })
  }

  async getById(wishlistId: string, currentUserId?: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        items: {
          include: {
            reservation: {
              select: {
                id: true,
                isAnonymous: true,
                status: true,
                userId: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        subscriptions: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    })

    if (!wishlist) throw new NotFoundException("Wishlist not found")

    // Privacy check
    if (wishlist.privacy === Privacy.PRIVATE && wishlist.userId !== currentUserId) {
      throw new ForbiddenException("This wishlist is private")
    }

    if (wishlist.privacy === Privacy.FRIENDS && wishlist.userId !== currentUserId) {
      if (!currentUserId) throw new ForbiddenException("This wishlist is for friends only")

      const isFriend = await this.friendsService.isFriend(currentUserId, wishlist.userId)

      if (!isFriend) {
        throw new ForbiddenException("This wishlist is for approved friends only")
      }
    }

    // Hide reservation details from wishlist owner (surprise mode)
    // Also serialize Decimal → number for currentPrice
    const isOwner = wishlist.userId === currentUserId
    const items = wishlist.items.map((item) => {
      const serialized = {
        ...item,
        currentPrice: item.currentPrice ? Number(item.currentPrice) : null,
      }

      if (isOwner && item.reservation) {
        return {
          ...serialized,
          reservation: {
            id: item.reservation.id,
            status: item.reservation.status,
            isReserved: true,
          },
        }
      }

      if (!isOwner && item.reservation) {
        return {
          ...serialized,
          reservation: {
            id: item.reservation.id,
            status: item.reservation.status,
            isAnonymous: item.reservation.isAnonymous,
            userId: item.reservation.isAnonymous ? undefined : item.reservation.userId,
            isReserved: true,
          },
        }
      }

      return serialized
    })

    // Check if current user is subscribed
    let subscriptionId: string | undefined
    let subscriptionStatus: SubscriptionStatus | undefined
    if (currentUserId) {
      const sub = await this.prisma.subscription.findUnique({
        where: {
          userId_wishlistId: { userId: currentUserId, wishlistId },
        },
      })
      subscriptionId = sub?.id
      subscriptionStatus = sub?.status
    }

    return { ...wishlist, items, subscriptionId, subscriptionStatus }
  }

  async update(wishlistId: string, userId: string, dto: UpdateWishlistDto) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
    })

    if (!wishlist) throw new NotFoundException("Wishlist not found")
    if (wishlist.userId !== userId) throw new ForbiddenException("Not your wishlist")

    // If privacy changed to PRIVATE, remove all subscriptions
    if (dto.privacy === Privacy.PRIVATE && wishlist.privacy !== Privacy.PRIVATE) {
      await this.prisma.subscription.deleteMany({
        where: { wishlistId },
      })
    }

    return this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: dto,
    })
  }

  async delete(wishlistId: string, userId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
    })

    if (!wishlist) throw new NotFoundException("Wishlist not found")
    if (wishlist.userId !== userId) throw new ForbiddenException("Not your wishlist")

    await this.prisma.wishlist.delete({ where: { id: wishlistId } })
    return { success: true }
  }

  async discover(search?: string, limit = 20, offset = 0) {
    // Cap limit to prevent abuse
    const takenLimit = Math.min(Math.max(1, limit), 100)
    const where: any = { privacy: Privacy.PUBLIC }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { displayName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [wishlists, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          items: {
            take: 4, // Preview items
            select: { imageUrl: true },
          },
          subscriptions: {
            select: {
              id: true,
              userId: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: takenLimit,
        skip: offset,
      }),
      this.prisma.wishlist.count({ where }),
    ])

    return { wishlists, total }
  }

  async discoverByUser(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId, privacy: Privacy.PUBLIC },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}
