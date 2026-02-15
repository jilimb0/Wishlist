import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { FriendsModule } from "../friends/friends.module"
import { WishlistsController } from "./wishlists.controller"
import { WishlistsService } from "./wishlists.service"

@Module({
  imports: [PrismaModule, FriendsModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
