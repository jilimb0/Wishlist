import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { NotificationType } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { ScraperService } from "../scraper/scraper.service"
import { TelegramService } from "../telegram/telegram.service"
import { PriceTrackingService } from "./price-tracking.service"

describe("PriceTrackingService", () => {
  let service: PriceTrackingService

  const prisma = {
    item: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    priceHistory: {
      createMany: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  }

  const scraper = {
    scrape: jest.fn(),
  }

  const config = {
    get: jest.fn(),
  }

  const telegramService = {
    notifyPriceDrop: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceTrackingService,
        { provide: PrismaService, useValue: prisma },
        { provide: ScraperService, useValue: scraper },
        { provide: ConfigService, useValue: config },
        { provide: TelegramService, useValue: telegramService },
      ],
    }).compile()
    service = module.get(PriceTrackingService)
  })

  it("skips tracking if disabled in config", async () => {
    config.get.mockReturnValue(false)
    await service.trackPrices()
    expect(prisma.item.findMany).not.toHaveBeenCalled()
  })

  it("scrapes active items and batches priceHistory and notifications on price drop", async () => {
    config.get.mockReturnValue(true)
    prisma.item.findMany.mockResolvedValue([
      {
        id: "item-1",
        url: "https://example.com/p1",
        currentPrice: 100,
        currency: "USD",
        title: "Mechanical Keyboard",
        wishlist: {
          id: "wl-1",
          title: "Wishlist",
          userId: "user-1",
          subscriptions: [{ userId: "sub-1", notifyNewItems: true }],
        },
      },
    ])

    scraper.scrape.mockResolvedValue({
      title: "Mechanical Keyboard",
      price: 80,
      currency: "USD",
    })

    await service.trackPrices()

    expect(prisma.priceHistory.createMany).toHaveBeenCalledWith({
      data: [{ itemId: "item-1", price: 80, currency: "USD" }],
    })
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.notification.createMany).toHaveBeenCalled()
    expect(telegramService.notifyPriceDrop).toHaveBeenCalledTimes(2)
  })
})
