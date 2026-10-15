import { timingSafeEqual } from "node:crypto"
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { TelegramService } from "./telegram.service"

interface AuthenticatedRequest {
  user: {
    id: string
  }
}

@Controller("telegram")
export class TelegramController {
  private readonly webhookSecret?: string

  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret =
      this.configService.get<string>("TELEGRAM_WEBHOOK_SECRET") ||
      process.env.TELEGRAM_WEBHOOK_SECRET
  }

  @UseGuards(JwtAuthGuard)
  @Get("link-url")
  async getLinkUrl(@Request() req: AuthenticatedRequest) {
    return this.telegramService.generateLinkToken(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post("disconnect")
  async disconnect(@Request() req: AuthenticatedRequest) {
    await this.telegramService.unlinkTelegram(req.user.id)
    return { success: true }
  }

  @Post("webhook")
  async webhook(
    @Body() update: Record<string, unknown>,
    @Headers("x-telegram-bot-api-secret-token") secretToken?: string,
  ) {
    if (this.webhookSecret) {
      if (
        !secretToken ||
        secretToken.length !== this.webhookSecret.length ||
        !timingSafeEqual(Buffer.from(secretToken), Buffer.from(this.webhookSecret))
      ) {
        throw new UnauthorizedException("Invalid Telegram webhook secret token")
      }
    }

    const handled = await this.telegramService.handleWebhookUpdate(update)
    return { ok: true, handled }
  }
}
