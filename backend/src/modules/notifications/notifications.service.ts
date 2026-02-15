import { Injectable, NotFoundException } from "@nestjs/common"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, limit = 20, offset = 0) {
    // Cap limit to prevent abuse
    const takenLimit = Math.min(Math.max(1, limit), 100)
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: takenLimit,
        skip: offset,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ])

    return { notifications, total }
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) throw new NotFoundException("Notification not found")
    if (notification.userId !== userId) {
      throw new NotFoundException("Notification not found")
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return { success: true }
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return { success: true }
  }
}
