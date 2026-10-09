import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { TelegramService } from "./telegram.service"

interface AuthenticatedRequest {
  user: {
    id: string
  }
}

@Controller("telegram")
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

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
  async webhook(@Body() update: Record<string, unknown>) {
    const handled = await this.telegramService.handleWebhookUpdate(update)
    return { ok: true, handled }
  }
}
