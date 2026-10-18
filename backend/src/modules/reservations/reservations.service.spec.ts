import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { TelegramService } from "../telegram/telegram.service"
import { ReservationsService } from "./reservations.service"

describe("ReservationsService", () => {
  let service: ReservationsService

  const prisma = {
    $transaction: jest.fn(),
    reservation: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  }

  const telegramService = {
    notifyReservation: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelegramService, useValue: telegramService },
      ],
    }).compile()
    service = module.get(ReservationsService)
  })

  describe("reserve", () => {
    it("successfully reserves an item in transaction and sends notification", async () => {
      const mockResult = {
        reservation: { id: "res-1", itemId: "item-1", userId: "user-2" },
        ownerId: "user-1",
        itemTitle: "PlayStation 5",
        reserverName: "Friend",
      }

      prisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          item: {
            findUnique: jest.fn().mockResolvedValue({
              id: "item-1",
              title: "PlayStation 5",
              wishlist: { userId: "user-1", id: "wl-1", title: "Tech" },
              reservation: null,
            }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ displayName: "Friend" }),
          },
          reservation: {
            create: jest.fn().mockResolvedValue(mockResult.reservation),
            delete: jest.fn(),
          },
          notification: {
            create: jest.fn().mockResolvedValue({ id: "notif-1" }),
          },
        })
      })

      const res = await service.reserve("item-1", "user-2", { isAnonymous: false })
      expect(res.id).toBe("res-1")
      expect(telegramService.notifyReservation).toHaveBeenCalledWith(
        "user-1",
        "PlayStation 5",
        "Friend",
      )
    })

    it("throws ConflictException on Prisma unique constraint error", async () => {
      prisma.$transaction.mockRejectedValue({ code: "P2002" })
      await expect(service.reserve("item-1", "user-2", { isAnonymous: false })).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe("cancel", () => {
    it("cancels reservation for owner", async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: "res-1", userId: "user-2" })
      prisma.reservation.delete.mockResolvedValue({ id: "res-1" })

      const result = await service.cancel("res-1", "user-2")
      expect(result.success).toBe(true)
      expect(prisma.reservation.delete).toHaveBeenCalledWith({ where: { id: "res-1" } })
    })

    it("throws ForbiddenException if another user tries to cancel", async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: "res-1", userId: "user-2" })
      await expect(service.cancel("res-1", "user-3")).rejects.toThrow(ForbiddenException)
    })

    it("throws NotFoundException if reservation is not found", async () => {
      prisma.reservation.findUnique.mockResolvedValue(null)
      await expect(service.cancel("res-none", "user-1")).rejects.toThrow(NotFoundException)
    })
  })
})
