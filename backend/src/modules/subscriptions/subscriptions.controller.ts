import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
// biome-ignore lint/style/useImportType: validation requirement
import { CreateSubscriptionDto } from "./dto/subscription.dto"
// biome-ignore lint/style/useImportType: DI requirement
import { SubscriptionsService } from "./subscriptions.service"

@Controller("api")
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post("wishlists/:id/subscribe")
  async subscribe(
    @Param("id") wishlistId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.subscribe(wishlistId, userId, dto)
  }

  @Get("subscriptions")
  async getMySubscriptions(@CurrentUser("id") userId: string) {
    return this.subscriptionsService.getMySubscriptions(userId)
  }

  @Delete("subscriptions/:id")
  async unsubscribe(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.subscriptionsService.unsubscribe(id, userId)
  }

  @Get("subscriptions/pending")
  async getPendingRequests(@CurrentUser("id") userId: string) {
    return this.subscriptionsService.getPendingRequests(userId)
  }

  @Post("subscriptions/:id/approve")
  async approve(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.subscriptionsService.updateStatus(id, userId, "APPROVED" as any)
  }

  @Post("subscriptions/:id/reject")
  async reject(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.subscriptionsService.updateStatus(id, userId, "PENDING" as any) // PENDING will cause deletion as per logic
  }
}
