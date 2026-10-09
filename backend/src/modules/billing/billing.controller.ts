import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { BillingService } from "./billing.service"

interface AuthenticatedRequest {
  user: {
    id: string
  }
}

@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("status")
  async getStatus(@Request() req: AuthenticatedRequest) {
    return this.billingService.getStatus(req.user.id)
  }

  @Post("promo")
  async activatePromo(@Request() req: AuthenticatedRequest, @Body("code") code: string) {
    return this.billingService.activatePromo(req.user.id, code)
  }

  @Post("checkout")
  async createCheckout(
    @Request() req: AuthenticatedRequest,
    @Body("plan") plan: "MONTHLY" | "YEARLY",
  ) {
    return this.billingService.createCheckout(req.user.id, plan || "MONTHLY")
  }

  @Post("confirm")
  async confirmPayment(
    @Request() req: AuthenticatedRequest,
    @Body("plan") plan: "MONTHLY" | "YEARLY",
  ) {
    return this.billingService.confirmPayment(req.user.id, plan || "MONTHLY")
  }
}
