import { Injectable, NotFoundException } from "@nestjs/common"
import { SubscriptionTier } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        currency: true,
        createdAt: true,
        telegramChatId: true,
        telegramUsername: true,
        subscriptionTier: true,
        trialEndsAt: true,
        proExpiresAt: true,
        _count: { select: { wishlists: true } },
      },
    })

    if (!user) throw new NotFoundException("User not found")

    const now = new Date()
    const isTrialActive = user.trialEndsAt ? user.trialEndsAt > now : true
    const isPro =
      user.subscriptionTier === SubscriptionTier.PRO ||
      isTrialActive ||
      (user.proExpiresAt ? user.proExpiresAt > now : false)

    return {
      ...user,
      isPro,
    }
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        currency: true,
        createdAt: true,
        telegramChatId: true,
        telegramUsername: true,
        subscriptionTier: true,
        trialEndsAt: true,
        proExpiresAt: true,
      },
    })

    const now = new Date()
    const isTrialActive = user.trialEndsAt ? user.trialEndsAt > now : true
    const isPro =
      user.subscriptionTier === SubscriptionTier.PRO ||
      isTrialActive ||
      (user.proExpiresAt ? user.proExpiresAt > now : false)

    return {
      ...user,
      isPro,
    }
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } })
    return { success: true }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    })
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    })

    if (!user) throw new NotFoundException("User not found")
    return user
  }

  // Alias for controller compat
  async findById(id: string) {
    return this.getMe(id)
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.updateMe(id, dto)
  }

  async getUserWishlists(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }
}
