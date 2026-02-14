import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { v4 as uuidv4 } from "uuid"
import { extname } from "path"
import { ItemsService } from "./items.service"
import { CreateItemDto, UpdateItemDto } from "./dto/item.dto"
import { CurrentUser } from "../../common/decorators/current-user.decorator"

@Controller("api")
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post("wishlists/:id/items")
  async addToWishlist(
    @Param("id") wishlistId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.addToWishlist(wishlistId, userId, dto)
  }

  @Patch("items/:id")
  async update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, userId, dto)
  }

  @Delete("items/:id")
  async delete(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.itemsService.delete(id, userId)
  }

  @Get("items/:id/price-history")
  async getPriceHistory(@Param("id") id: string) {
    return this.itemsService.getPriceHistory(id)
  }

  @Post("items/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = uuidv4()
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { imageUrl: `/uploads/${file.filename}` }
  }
}
