import { Controller, Get, Patch, Param, Query } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { CurrentUser } from "../../common/decorators/current-user.decorator"

@Controller("api/notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser("id") userId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.notificationsService.getNotifications(
      userId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    )
  }

  @Patch(":id/read")
  async markAsRead(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.notificationsService.markAsRead(id, userId)
  }

  @Patch("read-all")
  async markAllAsRead(@CurrentUser("id") userId: string) {
    return this.notificationsService.markAllAsRead(userId)
  }
}
