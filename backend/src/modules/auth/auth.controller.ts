import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
// biome-ignore lint/style/useImportType: DI requirement
import { AuthService } from "./auth.service"
// biome-ignore lint/style/useImportType: DI requirement
import { LoginDto, RegisterDto } from "./dto/auth.dto"
import { Public } from "./public.decorator"

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { success: true }
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: { token: string; password: string }) {
    return this.authService.resetPassword(dto)
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: { oldPassword?: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, dto)
  }
}
