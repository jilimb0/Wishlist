import { randomBytes } from "node:crypto"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { type BotClient, createBotClient, type InlineKeyboardMarkup } from "@tgwrapper/core"
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name)
  private readonly botToken: string | undefined
  private readonly botUsername: string
  private readonly botClient: BotClient | null = null

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.botToken = this.configService.get<string>("TELEGRAM_BOT_TOKEN")
    this.botUsername = this.configService.get<string>("TELEGRAM_BOT_USERNAME") || "WishTrackerBot"
    if (this.botToken) {
      this.botClient = createBotClient({ token: this.botToken })
    }
  }

  getBotUsername(): string {
    return this.botUsername
  }

  async generateLinkToken(userId: string): Promise<{ token: string; linkUrl: string }> {
    const token = randomBytes(24).toString("hex")
    await this.prisma.user.update({
      where: { id: userId },
      data: { telegramLinkToken: token },
    })

    const linkUrl = `https://t.me/${this.botUsername}?start=${token}`
    return { token, linkUrl }
  }

  async unlinkTelegram(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
        telegramUsername: null,
        telegramLinkToken: null,
      },
    })
  }

  async sendMessage(
    chatId: string,
    text: string,
    options?: { reply_markup?: InlineKeyboardMarkup },
  ): Promise<boolean> {
    if (!this.botClient) {
      this.logger.debug(`[DEV/MOCK] Telegram to ${chatId}: ${text}`)
      return true
    }

    try {
      await this.botClient.sendMessage(chatId, text, {
        parse_mode: "HTML",
        ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {}),
      })
      return true
    } catch (error) {
      this.logger.warn(`Failed to send Telegram message to ${chatId}: ${error}`)
      return false
    }
  }

  async handleWebhookUpdate(update: Record<string, unknown>): Promise<boolean> {
    const message = update?.message as
      | { chat?: { id?: number | string }; text?: string; from?: { username?: string } }
      | undefined
    if (!message?.text || !message.chat?.id) return false

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    const username = message.from?.username || null

    if (text.startsWith("/start")) {
      const parts = text.split(" ")
      const token = parts[1]

      if (token) {
        const user = await this.prisma.user.findUnique({
          where: { telegramLinkToken: token },
        })

        if (user) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              telegramChatId: chatId,
              telegramUsername: username,
              telegramLinkToken: null,
            },
          })

          await this.sendMessage(
            chatId,
            `🎉 <b>Добро пожаловать в WishTracker!</b>\n\nАккаунт <b>${user.displayName}</b> успешно привязан.\nТеперь вы будете получать уведомления о бронировании ваших подарков и скидках прямо сюда! 🎁`,
          )
          return true
        }
      }

      await this.sendMessage(
        chatId,
        "👋 Привет! Чтобы подключить уведомления WishTracker, перейдите в настройки профиля на сайте или в приложении и нажмите <b>«Подключить Telegram»</b>.",
      )
      return true
    }

    return false
  }

  async notifyReservation(userId: string, itemTitle: string, reserverName: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    })

    if (!user?.telegramChatId) return

    const message = `🎁 <b>Подарок забронирован!</b>\n\nТовар: <i>«${itemTitle}»</i>\nКто забронировал: <b>${reserverName}</b>\n\nНе забудьте заглянуть в свой вишлист!`
    const replyMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "🎁 Открыть подарок в боте",
            url: `https://t.me/${this.botUsername}`,
          },
        ],
      ],
    }
    await this.sendMessage(user.telegramChatId, message, { reply_markup: replyMarkup })
  }

  async notifyPriceDrop(
    userId: string,
    itemTitle: string,
    oldPrice: number,
    newPrice: number,
    currency: string,
    itemUrl: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    })

    if (!user?.telegramChatId) return

    const message = `📉 <b>Цена снизилась!</b>\n\nТовар: <i>«${itemTitle}»</i>\nСтарая цена: <s>${oldPrice} ${currency}</s>\nНовая цена: <b>${newPrice} ${currency}</b>\n\n🔗 <a href="${itemUrl}">Перейти к товару</a>`
    const replyMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "🛒 Перейти к покупке",
            url: itemUrl,
          },
        ],
      ],
    }
    await this.sendMessage(user.telegramChatId, message, { reply_markup: replyMarkup })
  }

  async notifyGroupGiftContribution(
    userId: string,
    itemTitle: string,
    contributorName: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    })

    if (!user?.telegramChatId) return

    const message = `🤝 <b>Новый взнос на совместный подарок!</b>\n\nТовар: <i>«${itemTitle}»</i>\nУчастник: <b>${contributorName}</b>\nСумма: <b>+${amount} ${currency}</b>`
    const replyMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "🤝 Сброситься на подарок",
            url: `https://t.me/${this.botUsername}`,
          },
        ],
      ],
    }
    await this.sendMessage(user.telegramChatId, message, { reply_markup: replyMarkup })
  }
}
