import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "../../prisma/prisma.module"
import { FriendsController } from "./friends.controller"
import { FriendsService } from "./friends.service"

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
