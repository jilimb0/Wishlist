import { NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { SubscriptionTier } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { UsersService } from "./users.service"

describe("UsersService", () => {
  let service: UsersService
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    wishlist: {
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(UsersService)
  })

  describe("getMe", () => {
    it("returns user with isPro true if user is PRO", async () => {
      const mockUser = {
        id: "u-1",
        email: "test@example.com",
        displayName: "Tester",
        avatarUrl: null,
        language: "en",
        currency: "USD",
        createdAt: new Date(),
        telegramChatId: null,
        telegramUsername: null,
        subscriptionTier: SubscriptionTier.PRO,
        trialEndsAt: null,
        proExpiresAt: null,
        _count: { wishlists: 2 },
      }
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.getMe("u-1")
      expect(result.id).toBe("u-1")
      expect(result.isPro).toBe(true)
    })

    it("throws NotFoundException when user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      await expect(service.getMe("u-none")).rejects.toThrow(NotFoundException)
    })
  })

  describe("updateMe", () => {
    it("updates and returns user info", async () => {
      const updated = {
        id: "u-1",
        email: "new@example.com",
        displayName: "NewName",
        avatarUrl: null,
        language: "ru",
        currency: "EUR",
        createdAt: new Date(),
        telegramChatId: null,
        telegramUsername: null,
        subscriptionTier: SubscriptionTier.FREE,
        trialEndsAt: new Date(Date.now() + 100000),
        proExpiresAt: null,
      }
      prisma.user.update.mockResolvedValue(updated)

      const result = await service.updateMe("u-1", { displayName: "NewName" })
      expect(result.displayName).toBe("NewName")
      expect(result.isPro).toBe(true)
    })
  })

  describe("deleteAccount", () => {
    it("deletes user record and returns success", async () => {
      prisma.user.delete.mockResolvedValue({ id: "u-1" })
      const res = await service.deleteAccount("u-1")
      expect(res.success).toBe(true)
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u-1" } })
    })
  })

  describe("getPublicProfile", () => {
    it("returns public user data", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "u-1",
        displayName: "Public User",
        avatarUrl: "https://avatar.url",
      })
      const profile = await service.getPublicProfile("u-1")
      expect(profile.displayName).toBe("Public User")
      expect(profile.avatarUrl).toBe("https://avatar.url")
    })
  })
})
