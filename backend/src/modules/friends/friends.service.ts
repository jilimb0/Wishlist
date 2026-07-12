import { randomBytes } from "node:crypto"
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { FriendshipStatus } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { MailService } from "../mail/mail.service"

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async sendRequest(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException("You cannot send a friend request to yourself")
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    })

    if (existingFriendship) {
      throw new ConflictException("Friendship or request already exists")
    }

    return this.prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: FriendshipStatus.PENDING,
      },
    })
  }

  async respondToRequest(userId: string, requestId: string, accept: boolean) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    })

    if (!request || request.friendId !== userId) {
      throw new NotFoundException("Friend request not found")
    }

    if (request.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException("Request already processed")
    }

    if (accept) {
      return this.prisma.friendship.update({
        where: { id: requestId },
        data: { status: FriendshipStatus.ACCEPTED },
      })
    }

    return this.prisma.friendship.delete({
      where: { id: requestId },
    })
  }

  async cancelRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    })

    if (!request || request.userId !== userId) {
      throw new NotFoundException("Friend request not found")
    }

    if (request.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException("Request already processed")
    }

    return this.prisma.friendship.delete({
      where: { id: requestId },
    })
  }

  async getMyFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
        friend: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    })

    return friendships.map((f) => {
      const user = f.userId === userId ? f.friend : f.user
      return {
        ...user,
        friendshipId: f.id,
      }
    })
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: userId }, { friendId: userId }],
        status: FriendshipStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        friend: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })
  }

  async isFriend(userId: string, otherId: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: otherId },
          { userId: otherId, friendId: userId },
        ],
        status: FriendshipStatus.ACCEPTED,
      },
    })
    return !!friendship
  }

  async searchUsers(query: string, currentUserId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        email: true,
      },
      take: 10,
    })

    // Include friendship status for each user
    return Promise.all(
      users.map(async (user) => {
        const friendship = await this.prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: currentUserId, friendId: user.id },
              { userId: user.id, friendId: currentUserId },
            ],
          },
        })
        return {
          ...user,
          friendship: friendship
            ? {
                id: friendship.id,
                status: friendship.status,
                isInitiator: friendship.userId === currentUserId,
                updatedAt: friendship.updatedAt,
              }
            : null,
        }
      }),
    )
  }

  async removeFriendship(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || (friendship.userId !== userId && friendship.friendId !== userId)) {
      throw new NotFoundException("Friendship or request not found")
    }

    return this.prisma.friendship.delete({
      where: { id: friendshipId },
    })
  }

  async createInvitation(inviterId: string, email: string) {
    const normalizedEmail = email.toLowerCase()
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
      select: { displayName: true },
    })

    const invitation = await this.prisma.invitation.create({
      data: {
        inviterId,
        email: normalizedEmail,
        token,
        expiresAt,
      },
    })

    const appUrl = this.config.get<string>("appUrl") || "http://localhost:3011"
    const link = `${appUrl}/register?token=${token}`

    await this.mail.send({
      to: normalizedEmail,
      subject: `${inviter?.displayName || "Someone"} invited you to WishTracker`,
      html: `<p>You were invited to join WishTracker.</p><p><a href="${link}">Accept invitation</a></p>`,
      text: `Join WishTracker: ${link}`,
    })

    return { ...invitation, inviteLink: link }
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        inviter: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    })

    if (!invitation) throw new NotFoundException("Invitation not found")
    if (invitation.isUsed) throw new BadRequestException("Invitation already used")
    if (invitation.expiresAt < new Date()) throw new BadRequestException("Invitation expired")

    return {
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      inviter: invitation.inviter,
    }
  }

  async redeemInvitation(userId: string, email: string, token: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } })

    if (!invitation) throw new NotFoundException("Invitation not found")
    if (invitation.isUsed) throw new BadRequestException("Invitation already used")
    if (invitation.expiresAt < new Date()) throw new BadRequestException("Invitation expired")
    if (invitation.email !== email.toLowerCase()) {
      throw new BadRequestException("Email does not match invitation")
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { isUsed: true },
      })

      const existing = await tx.friendship.findFirst({
        where: {
          OR: [
            { userId: invitation.inviterId, friendId: userId },
            { userId, friendId: invitation.inviterId },
          ],
        },
      })

      if (!existing) {
        await tx.friendship.create({
          data: {
            userId: invitation.inviterId,
            friendId: userId,
            status: FriendshipStatus.ACCEPTED,
          },
        })
      } else if (existing.status === FriendshipStatus.PENDING) {
        await tx.friendship.update({
          where: { id: existing.id },
          data: { status: FriendshipStatus.ACCEPTED },
        })
      }
    })

    return { success: true }
  }
}
