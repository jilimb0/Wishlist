import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { FriendshipStatus } from "@prisma/client"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException(
        "You cannot send a friend request to yourself",
      )
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

    return friendships.map((f: any) => {
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

    if (
      !friendship ||
      (friendship.userId !== userId && friendship.friendId !== userId)
    ) {
      throw new NotFoundException("Friendship or request not found")
    }

    return this.prisma.friendship.delete({
      where: { id: friendshipId },
    })
  }

  async createInvitation(inviterId: string, email: string) {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const invitation = await this.prisma.invitation.create({
      data: {
        inviterId,
        email,
        token,
        expiresAt,
      },
    })

    // In a real app, send email here. For now, log it.
    console.log(
      `[INVITE] To: ${email}, Link: http://localhost:3011/register?token=${token}`,
    )

    return invitation
  }
}
