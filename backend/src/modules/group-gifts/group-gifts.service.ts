import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { ItemStatus, NotificationType } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { TelegramService } from "../telegram/telegram.service"

export interface CreateContributionDto {
  contributorName: string
  amount: number
  currency?: string
  message?: string
}

@Injectable()
export class GroupGiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async getContributions(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        title: true,
        isGroupGift: true,
        targetAmount: true,
        currency: true,
      },
    })

    if (!item) {
      throw new NotFoundException("Item not found")
    }

    const contributions = await this.prisma.groupGiftContribution.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      itemId,
      targetAmount: item.targetAmount ? Number(item.targetAmount) : null,
      currency: item.currency,
      totalContributed,
      contributionCount: contributions.length,
      contributions: contributions.map((c) => ({
        id: c.id,
        itemId: c.itemId,
        userId: c.userId,
        contributorName: c.contributorName,
        amount: Number(c.amount),
        currency: c.currency,
        message: c.message,
        createdAt: c.createdAt.toISOString(),
      })),
    }
  }

  async addContribution(itemId: string, dto: CreateContributionDto, userId?: string) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException("Contribution amount must be greater than zero")
    }

    if (!dto.contributorName || dto.contributorName.trim().length === 0) {
      throw new BadRequestException("Contributor name is required")
    }

    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        wishlist: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!item) {
      throw new NotFoundException("Item not found")
    }

    const contribution = await this.prisma.groupGiftContribution.create({
      data: {
        itemId,
        userId: userId || null,
        contributorName: dto.contributorName.trim(),
        amount: dto.amount,
        currency: dto.currency || item.currency,
        message: dto.message?.trim() || null,
      },
    })

    // Calculate new total
    const all = await this.prisma.groupGiftContribution.findMany({
      where: { itemId },
    })
    const total = all.reduce((sum, c) => sum + Number(c.amount), 0)

    // If goal reached, optionally mark item completed
    if (item.targetAmount && total >= Number(item.targetAmount)) {
      await this.prisma.item.update({
        where: { id: itemId },
        data: { status: ItemStatus.COMPLETED },
      })
    }

    // In-app Notification for the wishlist owner
    const ownerId = item.wishlist.userId
    if (ownerId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: ownerId,
          type: NotificationType.GROUP_GIFT_CONTRIBUTION,
          title: "Взнос на подарок",
          message: `${dto.contributorName} внес(ла) ${dto.amount} ${dto.currency || item.currency} на «${item.title}»`,
          relatedItemId: itemId,
        },
      })

      // Telegram notification
      await this.telegramService.notifyGroupGiftContribution(
        ownerId,
        item.title,
        dto.contributorName,
        dto.amount,
        dto.currency || item.currency,
      )
    }

    return {
      contribution: {
        id: contribution.id,
        itemId: contribution.itemId,
        userId: contribution.userId,
        contributorName: contribution.contributorName,
        amount: Number(contribution.amount),
        currency: contribution.currency,
        message: contribution.message,
        createdAt: contribution.createdAt.toISOString(),
      },
      totalContributed: total,
    }
  }

  async deleteContribution(contributionId: string, currentUserId: string) {
    const contribution = await this.prisma.groupGiftContribution.findUnique({
      where: { id: contributionId },
      include: {
        item: {
          include: {
            wishlist: true,
          },
        },
      },
    })

    if (!contribution) {
      throw new NotFoundException("Contribution not found")
    }

    const isContributor = contribution.userId === currentUserId
    const isOwner = contribution.item.wishlist.userId === currentUserId

    if (!isContributor && !isOwner) {
      throw new ForbiddenException("You cannot delete this contribution")
    }

    await this.prisma.groupGiftContribution.delete({
      where: { id: contributionId },
    })

    return { success: true }
  }
}
