import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { FriendshipStatus } from "@prisma/client"

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
    } else {
      return this.prisma.friendship.delete({
        where: { id: requestId },
      })
    }
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

    return friendships.map((f: any) =>
      f.userId === userId ? f.friend : f.user,
    )
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        friendId: userId,
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
    return this.prisma.user.findMany({
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
