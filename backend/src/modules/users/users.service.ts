import { Injectable, NotFoundException } from "@nestjs/common"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"
// biome-ignore lint/style/useImportType: validation requirement
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
        _count: { select: { wishlists: true } },
      },
    })

    if (!user) throw new NotFoundException("User not found")
    return user
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
      },
    })

    return user
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
  async findById(userId: string) {
    return this.getMe(userId)
  }

  async update(userId: string, dto: UpdateUserDto) {
    return this.updateMe(userId, dto)
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        currency: true,
        createdAt: true,
      },
    })
    return user
  }
  async deleteAccount(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    })
  }
}
