import { extname } from "node:path"
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { v4 as uuidv4 } from "uuid"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { Public } from "../auth/public.decorator"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { UsersService } from "./users.service"

@Controller("api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  async getMe(@CurrentUser("id") userId: string) {
    return this.usersService.findById(userId)
  }

  @Patch("me")
  async updateMe(@CurrentUser("id") userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto)
  }

  @Delete("me")
  async deleteMe(@CurrentUser("id") userId: string) {
    return this.usersService.deleteAccount(userId)
  }

  @Public()
  @Get(":id")
  async getUser(@Param("id") id: string) {
    return this.usersService.findById(id)
  }

  @Post("me/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (_req, file, cb) => {
          const randomName = uuidv4()
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(@CurrentUser("id") userId: string, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `/uploads/${file.filename}`
    return this.usersService.updateAvatar(userId, avatarUrl)
  }
}
