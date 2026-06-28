import { NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { NotificationsService } from "./notifications.service"

const userId = "user-1"
const notificationId = "notif-1"

describe("NotificationsService", () => {
  let service: NotificationsService
  const prisma = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = module.get(NotificationsService)
  })

  describe("getNotifications", () => {
    it("returns paginated notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([{ id: notificationId, title: "Test" }])
      prisma.notification.count.mockResolvedValue(1)
      const result = await service.getNotifications(userId)
      expect(result.notifications).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe("markAsRead", () => {
    it("marks notification as read", async () => {
      prisma.notification.findUnique.mockResolvedValue({ id: notificationId, userId })
      prisma.notification.update.mockResolvedValue({ id: notificationId, isRead: true })
      const result = await service.markAsRead(notificationId, userId)
      expect(result.success).toBe(true)
    })

    it("throws when not found", async () => {
      prisma.notification.findUnique.mockResolvedValue(null)
      await expect(service.markAsRead(notificationId, userId)).rejects.toBeInstanceOf(NotFoundException)
    })

    it("throws when not owned by user", async () => {
      prisma.notification.findUnique.mockResolvedValue({ id: notificationId, userId: "other" })
      await expect(service.markAsRead(notificationId, userId)).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe("markAllAsRead", () => {
    it("marks all unread as read", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 })
      const result = await service.markAllAsRead(userId)
      expect(result.success).toBe(true)
    })
  })
})
