import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common"
import { WishlistsService } from "./wishlists.service"
import { CreateWishlistDto, UpdateWishlistDto } from "./dto/wishlist.dto"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { Public } from "../auth/public.decorator"

@Controller("api")
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Get("wishlists")
  async getMyWishlists(@CurrentUser("id") userId: string) {
    return this.wishlistsService.getMyWishlists(userId)
  }

  @Post("wishlists")
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateWishlistDto,
  ) {
    return this.wishlistsService.create(userId, dto)
  }

  // Public so unauthenticated users can view PUBLIC wishlists.
  // currentUserId will be undefined for unauthenticated requests.
  @Public()
  @Get("wishlists/:id")
  async getById(@Param("id") id: string, @CurrentUser("id") userId?: string) {
    return this.wishlistsService.getById(id, userId)
  }

  @Patch("wishlists/:id")
  async update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.update(id, userId, dto)
  }

  @Delete("wishlists/:id")
  async delete(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.wishlistsService.delete(id, userId)
  }

  // ─── Discovery ──────────────────────────────────────────────

  @Public()
  @Get("discover")
  async discover(
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.wishlistsService.discover(
      search,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    )
  }

  @Public()
  @Get("discover/user/:userId")
  async discoverByUser(@Param("userId") userId: string) {
    return this.wishlistsService.discoverByUser(userId)
  }
}
