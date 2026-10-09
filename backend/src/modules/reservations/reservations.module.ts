import { Module } from "@nestjs/common"
import { TelegramModule } from "../telegram/telegram.module"
import { ReservationsController } from "./reservations.controller"
import { ReservationsService } from "./reservations.service"

@Module({
  imports: [TelegramModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
