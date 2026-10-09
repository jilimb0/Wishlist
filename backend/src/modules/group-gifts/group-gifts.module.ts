import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PrismaModule } from "../../prisma/prisma.module"
import { TelegramModule } from "../telegram/telegram.module"
import { GroupGiftsController } from "./group-gifts.controller"
import { GroupGiftsService } from "./group-gifts.service"

@Module({
  imports: [PrismaModule, TelegramModule, JwtModule.register({})],
  controllers: [GroupGiftsController],
  providers: [GroupGiftsService],
  exports: [GroupGiftsService],
})
export class GroupGiftsModule {}
