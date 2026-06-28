import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { ItemsService } from "./items.service"

const userId = "user-1"
const otherUserId = "user-2"
const wishlistId = "wl-1"
const itemId = "item-1"

describe("ItemsService", () => {
  let service: ItemsService
  const prisma = {
    wishlist: { findUnique: jest.fn() },
    item: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    priceHistory: { create: jest.fn(), findMany: jest.fn() },
    notification: { createMany: jest.fn() },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = module.get(ItemsService)
  })

  describe("addToWishlist", () => {
    const validDto = { title: "New Item", url: "https://example.com/item" }

    it("throws NotFoundException when wishlist does not exist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue(null)
      await expect(service.addToWishlist(wishlistId, userId, validDto)).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it("throws ForbiddenException when not wishlist owner", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: otherUserId, subscriptions: [] })
      await expect(service.addToWishlist(wishlistId, userId, validDto)).rejects.toBeInstanceOf(
        ForbiddenException,
      )
    })

    it("throws BadRequestException when no title or URL", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId, subscriptions: [] })
      await expect(service.addToWishlist(wishlistId, userId, {})).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })

    it("creates item and records initial price", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId, subscriptions: [] })
      prisma.user.findUnique.mockResolvedValue({ id: userId, currency: "USD" })
      prisma.item.create.mockResolvedValue({
        id: itemId,
        wishlistId,
        title: "New Item",
        currentPrice: "29.99",
      })
      const dto = { title: "New Item", url: "https://example.com", price: 29.99 }
      const result = await service.addToWishlist(wishlistId, userId, dto)
      expect(result.id).toBe(itemId)
      expect(prisma.priceHistory.create).toHaveBeenCalled()
    })

    it("notifies subscribers with notifyNewItems enabled", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId,
        subscriptions: [
          { userId: "sub-1", notifyNewItems: true },
          { userId: "sub-2", notifyNewItems: false },
        ],
      })
      prisma.user.findUnique.mockResolvedValue({ id: userId, currency: "USD" })
      prisma.item.create.mockResolvedValue({
        id: itemId,
        wishlistId,
        title: "New Item",
        currentPrice: null,
      })
      await service.addToWishlist(wishlistId, userId, { title: "New Item", url: "https://x.com" })
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([expect.objectContaining({ userId: "sub-1" })]),
      })
      // sub-2 should NOT receive notification
      const calls = (prisma.notification.createMany as jest.Mock).mock.calls[0][0]
      expect(calls.data).toHaveLength(1)
      expect(calls.data[0].userId).toBe("sub-1")
    })
  })

  describe("update", () => {
    it("throws NotFoundException when item does not exist", async () => {
      prisma.item.findUnique.mockResolvedValue(null)
      await expect(service.update(itemId, userId, {})).rejects.toBeInstanceOf(NotFoundException)
    })

    it("throws ForbiddenException when not wishlist owner", async () => {
      prisma.item.findUnique.mockResolvedValue({
        id: itemId,
        wishlist: { userId: otherUserId },
      })
      await expect(service.update(itemId, userId, {})).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("updates item when owner", async () => {
      prisma.item.findUnique.mockResolvedValue({
        id: itemId,
        wishlist: { userId },
        currentPrice: "10.00",
      })
      prisma.user.findUnique.mockResolvedValue({ id: userId, currency: "USD" })
      prisma.item.update.mockResolvedValue({
        id: itemId,
        title: "Updated",
        currentPrice: "15.00",
      })
      const result = await service.update(itemId, userId, { title: "Updated", price: 15 })
      expect(result.title).toBe("Updated")
    })
  })

  describe("delete", () => {
    it("deletes item when owner", async () => {
      prisma.item.findUnique.mockResolvedValue({
        id: itemId,
        wishlist: { userId },
      })
      prisma.item.delete.mockResolvedValue({ id: itemId })
      const result = await service.delete(itemId, userId)
      expect(result.success).toBe(true)
    })
  })

  describe("getPriceHistory", () => {
    it("returns price history for an item", async () => {
      prisma.item.findUnique.mockResolvedValue({ id: itemId })
      prisma.priceHistory.findMany.mockResolvedValue([
        { id: "ph-1", price: "29.99", checkedAt: new Date() },
      ])
      const result = await service.getPriceHistory(itemId)
      expect(result).toHaveLength(1)
      expect(result[0].price).toBe(29.99)
    })

    it("throws NotFoundException when item does not exist", async () => {
      prisma.item.findUnique.mockResolvedValue(null)
      await expect(service.getPriceHistory(itemId)).rejects.toBeInstanceOf(NotFoundException)
    })
  })
})
