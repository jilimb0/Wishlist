import { Controller, Get } from "@nestjs/common"
import { Public } from "./modules/auth/public.decorator"

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello() {
    return {
      message: "WishTracker API is active",
      status: "OK",
      version: "1.0.0",
    }
  }
}
