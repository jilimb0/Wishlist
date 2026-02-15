import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import type { CreateReservationDto } from "./dto/reservation.dto"
import type { ReservationsService } from "./reservations.service"

@Controller("api")
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post("items/:id/reserve")
  async reserve(
    @Param("id") itemId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.reserve(itemId, userId, dto)
  }

  @Delete("reservations/:id")
  async cancel(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.reservationsService.cancel(id, userId)
  }

  @Get("reservations/my")
  async getMyReservations(@CurrentUser("id") userId: string) {
    return this.reservationsService.getMyReservations(userId)
  }
}
