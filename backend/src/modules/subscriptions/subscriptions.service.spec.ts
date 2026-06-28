import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { SubscriptionsService } from "./subscriptions.service"

const userId = "user-1"
const ownerId = "owner-1"
const wishlistId = "wl-1"
const subscriptionId = "sub-1"

describe("SubscriptionsService", () => {
  let service: SubscriptionsService
  const prisma = {
    wishlist: { findUnique: jest.fn() },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notification: { create: jest.fn() },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = module.get(SubscriptionsService)
  })

  describe("subscribe", () => {
    it("throws when wishlist not found", async () => {
      prisma.wishlist.findUnique.mockResolvedValue(null)
      await expect(service.subscribe(wishlistId, userId, {})).rejects.toBeInstanceOf(NotFoundException)
    })

    it("throws when subscribing to own wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId, privacy: "PUBLIC" })
      await expect(service.subscribe(wishlistId, userId, {})).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("throws when wishlist is private", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: ownerId, privacy: "PRIVATE" })
      await expect(service.subscribe(wishlistId, userId, {})).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("throws when already subscribed", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: ownerId, privacy: "PUBLIC" })
      prisma.subscription.findUnique.mockResolvedValue({ id: subscriptionId })
      await expect(service.subscribe(wishlistId, userId, {})).rejects.toBeInstanceOf(ConflictException)
    })

    it("creates APPROVED subscription for public wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: ownerId, privacy: "PUBLIC" })
      prisma.subscription.findUnique.mockResolvedValue(null)
      prisma.subscription.create.mockResolvedValue({ id: subscriptionId, status: "APPROVED" })
      const result = await service.subscribe(wishlistId, userId, {})
      expect(result.status).toBe("APPROVED")
    })

    it("creates PENDING subscription for friends-only wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: ownerId, privacy: "FRIENDS" })
      prisma.subscription.findUnique.mockResolvedValue(null)
      prisma.subscription.create.mockResolvedValue({ id: subscriptionId, status: "PENDING" })
      const result = await service.subscribe(wishlistId, userId, {})
      expect(result.status).toBe("PENDING")
    })
  })

  describe("unsubscribe", () => {
    it("removes subscription", async () => {
      prisma.subscription.findUnique.mockResolvedValue({ id: subscriptionId, userId })
      prisma.subscription.delete.mockResolvedValue({ id: subscriptionId })
      const result = await service.unsubscribe(subscriptionId, userId)
      expect(result.success).toBe(true)
    })

    it("throws when not subscription owner", async () => {
      prisma.subscription.findUnique.mockResolvedValue({ id: subscriptionId, userId: "other" })
      await expect(service.unsubscribe(subscriptionId, userId)).rejects.toBeInstanceOf(ForbiddenException)
    })
  })

  describe("updateStatus", () => {
    it("approves subscription and creates notification", async () => {
      prisma.subscription.findUnique.mockResolvedValue({
        id: subscriptionId,
        wishlist: { userId: ownerId },
        userId,
      })
      prisma.subscription.update.mockResolvedValue({
        id: subscriptionId,
        status: "APPROVED",
        wishlist: { title: "Test Wishlist" },
        user: { id: userId },
      })
      prisma.notification.create.mockResolvedValue({})
      const result = await service.updateStatus(subscriptionId, ownerId, "APPROVED" as any)
      expect(prisma.notification.create).toHaveBeenCalled()
    })

    it("rejects by deleting", async () => {
      prisma.subscription.findUnique.mockResolvedValue({
        id: subscriptionId,
        wishlist: { userId: ownerId },
        userId,
      })
      prisma.subscription.delete.mockResolvedValue({ id: subscriptionId })
      const result = await service.updateStatus(subscriptionId, ownerId, "REJECTED" as any) as any
      expect(result.success).toBe(true)
    })
  })
})
