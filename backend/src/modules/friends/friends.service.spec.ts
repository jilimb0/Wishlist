import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { MailService } from "../mail/mail.service"
import { FriendsService } from "./friends.service"

const userId = "user-1"
const friendId = "user-2"
const requestId = "req-1"

describe("FriendsService", () => {
  let service: FriendsService
  const prisma: any = {
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invitation: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  }
  const mail = { send: jest.fn() }
  const config = { get: jest.fn(() => "http://localhost:3011") }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()
    service = module.get(FriendsService)
  })

  describe("sendRequest", () => {
    it("throws error when sending to self", async () => {
      await expect(service.sendRequest(userId, userId)).rejects.toBeInstanceOf(BadRequestException)
    })

    it("throws error when friendship already exists", async () => {
      prisma.friendship.findFirst.mockResolvedValue({ id: "existing" })
      await expect(service.sendRequest(userId, friendId)).rejects.toBeInstanceOf(ConflictException)
    })

    it("creates pending friendship request", async () => {
      prisma.friendship.findFirst.mockResolvedValue(null)
      prisma.friendship.create.mockResolvedValue({ id: requestId })
      const result = await service.sendRequest(userId, friendId)
      expect(result.id).toBe(requestId)
    })
  })

  describe("respondToRequest", () => {
    it("accepts request", async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: requestId,
        friendId: userId,
        status: "PENDING",
      })
      prisma.friendship.update.mockResolvedValue({ id: requestId, status: "ACCEPTED" })
      const result = await service.respondToRequest(userId, requestId, true)
      expect(result.status).toBe("ACCEPTED")
    })

    it("declines by deleting", async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: requestId,
        friendId: userId,
        status: "PENDING",
      })
      prisma.friendship.delete.mockResolvedValue({ id: requestId })
      const result = await service.respondToRequest(userId, requestId, false)
      expect(result.id).toBe(requestId)
    })

    it("throws on already processed request", async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: requestId,
        friendId: userId,
        status: "ACCEPTED",
      })
      await expect(service.respondToRequest(userId, requestId, true)).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })
  })

  describe("isFriend", () => {
    it("returns true when friendship exists", async () => {
      prisma.friendship.findFirst.mockResolvedValue({ id: "f1", status: "ACCEPTED" })
      expect(await service.isFriend(userId, friendId)).toBe(true)
    })

    it("returns false when no friendship", async () => {
      prisma.friendship.findFirst.mockResolvedValue(null)
      expect(await service.isFriend(userId, friendId)).toBe(false)
    })
  })

  describe("removeFriendship", () => {
    it("removes existing friendship", async () => {
      prisma.friendship.findUnique.mockResolvedValue({ id: "f1", userId, friendId })
      prisma.friendship.delete.mockResolvedValue({ id: "f1" })
      const result = await service.removeFriendship(userId, "f1")
      expect(result.id).toBe("f1")
    })

    it("throws when not involved", async () => {
      prisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        userId: "other",
        friendId: "other2",
      })
      await expect(service.removeFriendship(userId, "f1")).rejects.toBeInstanceOf(NotFoundException)
    })
  })
})
