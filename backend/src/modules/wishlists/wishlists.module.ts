import { Module } from "@nestjs/common"
import { WishlistsController } from "./wishlists.controller"
import { WishlistsService } from "./wishlists.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { FriendsModule } from "../friends/friends.module"

@Module({
  imports: [PrismaModule, FriendsModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
