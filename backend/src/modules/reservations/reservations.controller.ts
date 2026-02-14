import { Controller, Post, Delete, Get, Body, Param } from "@nestjs/common"
import { ReservationsService } from "./reservations.service"
import { CreateReservationDto } from "./dto/reservation.dto"
import { CurrentUser } from "../../common/decorators/current-user.decorator"

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
