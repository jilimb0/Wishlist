import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { FriendsService } from "../friends/friends.service"
import { WishlistsService } from "./wishlists.service"

const userId = "user-1"
const otherUserId = "user-2"
const wishlistId = "wl-1"

describe("WishlistsService", () => {
  let service: WishlistsService
  const prisma = {
    wishlist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  }
  const friendsService = {
    isFriend: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistsService,
        { provide: PrismaService, useValue: prisma },
        { provide: FriendsService, useValue: friendsService },
      ],
    }).compile()
    service = module.get(WishlistsService)
  })

  describe("create", () => {
    it("creates a wishlist for the user", async () => {
      const dto = { title: "My Wishlist", privacy: "PUBLIC" as any }
      prisma.wishlist.create.mockResolvedValue({ id: wishlistId, ...dto, userId })
      const result = await service.create(userId, dto)
      expect(result.id).toBe(wishlistId)
      expect(prisma.wishlist.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      })
    })
  })

  describe("getMyWishlists", () => {
    it("returns user wishlists with item count", async () => {
      prisma.wishlist.findMany.mockResolvedValue([
        { id: wishlistId, items: [], _count: { items: 0 } },
      ])
      const result = await service.getMyWishlists(userId)
      expect(result).toHaveLength(1)
    })
  })

  describe("getById", () => {
    it("throws NotFoundException when wishlist does not exist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue(null)
      await expect(service.getById(wishlistId)).rejects.toBeInstanceOf(NotFoundException)
    })

    it("throws ForbiddenException for private wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId: otherUserId,
        privacy: "PRIVATE",
        items: [],
        subscriptions: [],
        user: { id: otherUserId, displayName: "Other", avatarUrl: null },
      })
      await expect(service.getById(wishlistId, userId)).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("allows owner to view private wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId,
        privacy: "PRIVATE",
        items: [],
        subscriptions: [],
        user: { id: userId, displayName: "Me", avatarUrl: null },
      })
      prisma.subscription.findUnique.mockResolvedValue(null)
      const result = await service.getById(wishlistId, userId)
      expect(result.id).toBe(wishlistId)
    })

    it("allows friends to view friends-only wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId: otherUserId,
        privacy: "FRIENDS",
        items: [],
        subscriptions: [],
        user: { id: otherUserId, displayName: "Other", avatarUrl: null },
      })
      friendsService.isFriend.mockResolvedValue(true)
      prisma.subscription.findUnique.mockResolvedValue(null)
      const result = await service.getById(wishlistId, userId)
      expect(result.id).toBe(wishlistId)
    })

    it("denies non-friends for friends-only wishlist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId: otherUserId,
        privacy: "FRIENDS",
        items: [],
        subscriptions: [],
        user: { id: otherUserId, displayName: "Other", avatarUrl: null },
      })
      friendsService.isFriend.mockResolvedValue(false)
      await expect(service.getById(wishlistId, userId)).rejects.toBeInstanceOf(ForbiddenException)
    })
  })

  describe("update", () => {
    it("throws NotFoundException when wishlist does not exist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue(null)
      await expect(service.update(wishlistId, userId, { title: "New" })).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it("throws ForbiddenException when not owner", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: otherUserId })
      await expect(service.update(wishlistId, userId, { title: "New" })).rejects.toBeInstanceOf(
        ForbiddenException,
      )
    })

    it("updates wishlist when owner", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId })
      prisma.wishlist.update.mockResolvedValue({ id: wishlistId, title: "Updated" })
      const result = await service.update(wishlistId, userId, { title: "Updated" })
      expect(result.title).toBe("Updated")
    })

    it("removes subscriptions when changing to private", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({
        id: wishlistId,
        userId,
        privacy: "PUBLIC",
      })
      prisma.wishlist.update.mockResolvedValue({ id: wishlistId, privacy: "PRIVATE" })
      await service.update(wishlistId, userId, { privacy: "PRIVATE" as any })
      expect(prisma.subscription.deleteMany).toHaveBeenCalledWith({ where: { wishlistId } })
    })
  })

  describe("delete", () => {
    it("throws NotFoundException when wishlist does not exist", async () => {
      prisma.wishlist.findUnique.mockResolvedValue(null)
      await expect(service.delete(wishlistId, userId)).rejects.toBeInstanceOf(NotFoundException)
    })

    it("throws ForbiddenException when not owner", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId: otherUserId })
      await expect(service.delete(wishlistId, userId)).rejects.toBeInstanceOf(ForbiddenException)
    })

    it("deletes wishlist when owner", async () => {
      prisma.wishlist.findUnique.mockResolvedValue({ id: wishlistId, userId })
      prisma.wishlist.delete.mockResolvedValue({ id: wishlistId })
      const result = await service.delete(wishlistId, userId)
      expect(result.success).toBe(true)
    })
  })

  describe("discover", () => {
    it("returns public wishlists with pagination", async () => {
      prisma.wishlist.findMany.mockResolvedValue([])
      prisma.wishlist.count.mockResolvedValue(0)
      const result = await service.discover()
      expect(result.wishlists).toEqual([])
      expect(result.total).toBe(0)
    })

    it("caps limit to 100", async () => {
      prisma.wishlist.findMany.mockResolvedValue([])
      prisma.wishlist.count.mockResolvedValue(0)
      await service.discover(undefined, 999)
      expect(prisma.wishlist.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }))
    })
  })
})
