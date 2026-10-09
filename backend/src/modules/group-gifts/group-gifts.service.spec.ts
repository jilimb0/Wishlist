import { Test, type TestingModule } from "@nestjs/testing"
import { ItemStatus } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { TelegramService } from "../telegram/telegram.service"
import { GroupGiftsService } from "./group-gifts.service"

describe("GroupGiftsService", () => {
  let service: GroupGiftsService

  const mockPrisma = {
    item: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    groupGiftContribution: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  }

  const mockTelegram = {
    notifyGroupGiftContribution: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupGiftsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: TelegramService,
          useValue: mockTelegram,
        },
      ],
    }).compile()

    service = module.get(GroupGiftsService)
    jest.clearAllMocks()
  })

  it("adds contribution and sends notification to owner", async () => {
    mockPrisma.item.findUnique.mockResolvedValueOnce({
      id: "item-1",
      title: "PlayStation 5",
      currency: "RUB",
      targetAmount: 50000,
      wishlist: { userId: "owner-id" },
    })

    mockPrisma.groupGiftContribution.create.mockResolvedValueOnce({
      id: "contrib-1",
      itemId: "item-1",
      userId: "friend-id",
      contributorName: "Bob",
      amount: 5000,
      currency: "RUB",
      message: "Happy Birthday!",
      createdAt: new Date(),
    })

    mockPrisma.groupGiftContribution.findMany.mockResolvedValueOnce([{ amount: 5000 }])

    const res = await service.addContribution(
      "item-1",
      {
        contributorName: "Bob",
        amount: 5000,
        message: "Happy Birthday!",
      },
      "friend-id",
    )

    expect(res.contribution.amount).toBe(5000)
    expect(res.totalContributed).toBe(5000)
    expect(mockPrisma.notification.create).toHaveBeenCalled()
    expect(mockTelegram.notifyGroupGiftContribution).toHaveBeenCalledWith(
      "owner-id",
      "PlayStation 5",
      "Bob",
      5000,
      "RUB",
    )
  })

  it("marks item completed when target amount is reached", async () => {
    mockPrisma.item.findUnique.mockResolvedValueOnce({
      id: "item-1",
      title: "Watch",
      currency: "USD",
      targetAmount: 100,
      wishlist: { userId: "owner-id" },
    })

    mockPrisma.groupGiftContribution.create.mockResolvedValueOnce({
      id: "contrib-2",
      itemId: "item-1",
      userId: null,
      contributorName: "Charlie",
      amount: 100,
      currency: "USD",
      createdAt: new Date(),
    })

    mockPrisma.groupGiftContribution.findMany.mockResolvedValueOnce([{ amount: 100 }])

    await service.addContribution("item-1", {
      contributorName: "Charlie",
      amount: 100,
    })

    expect(mockPrisma.item.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { status: ItemStatus.COMPLETED },
    })
  })
})
