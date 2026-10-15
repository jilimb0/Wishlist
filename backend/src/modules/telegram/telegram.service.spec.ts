import { ConfigService } from "@nestjs/config"
import { Test, type TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../prisma/prisma.service"
import { TelegramService } from "./telegram.service"

describe("TelegramService", () => {
  let service: TelegramService

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === "TELEGRAM_BOT_TOKEN") return null // dev mode
              if (key === "TELEGRAM_BOT_USERNAME") return "TestWishTrackerBot"
              return null
            },
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get(TelegramService)
    jest.clearAllMocks()
  })

  it("generates a link token and t.me link URL", async () => {
    mockPrisma.user.update.mockResolvedValueOnce({ id: "user-1" })

    const result = await service.generateLinkToken("user-1")
    expect(result.token).toBeDefined()
    expect(result.linkUrl).toContain("https://t.me/TestWishTrackerBot?start=")
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
      }),
    )
  })

  it("links user on /start <token> webhook update", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      displayName: "Alice",
      telegramLinkToken: "valid-token",
    })
    mockPrisma.user.update.mockResolvedValueOnce({ id: "user-1" })

    const handled = await service.handleWebhookUpdate({
      message: {
        chat: { id: 12345678 },
        text: "/start valid-token",
        from: { username: "alice_tg" },
      },
    })

    expect(handled).toBe(true)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        telegramChatId: "12345678",
        telegramUsername: "alice_tg",
        telegramLinkToken: null,
      },
    })
  })

  it("unlinks telegram credentials", async () => {
    mockPrisma.user.update.mockResolvedValueOnce({ id: "user-1" })

    await service.unlinkTelegram("user-1")
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        telegramChatId: null,
        telegramUsername: null,
        telegramLinkToken: null,
      },
    })
  })

  it("sends notifications with inline buttons when user has telegramChatId", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      telegramChatId: "12345678",
    })

    const sendSpy = jest.spyOn(service, "sendMessage").mockResolvedValue(true)

    await service.notifyReservation("user-1", "MacBook Pro", "Bob")
    expect(sendSpy).toHaveBeenCalledWith(
      "12345678",
      expect.stringContaining("MacBook Pro"),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.any(Array),
        }),
      }),
    )

    await service.notifyPriceDrop(
      "user-1",
      "MacBook Pro",
      2000,
      1800,
      "USD",
      "https://example.com/macbook",
    )
    expect(sendSpy).toHaveBeenCalledWith(
      "12345678",
      expect.stringContaining("1800 USD"),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.any(Array),
        }),
      }),
    )

    await service.notifyGroupGiftContribution("user-1", "MacBook Pro", "Charlie", 100, "USD")
    expect(sendSpy).toHaveBeenCalledWith(
      "12345678",
      expect.stringContaining("+100 USD"),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.any(Array),
        }),
      }),
    )
  })
})
