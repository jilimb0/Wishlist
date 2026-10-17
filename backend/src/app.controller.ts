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

  @Public()
  @Get("api/health")
  health() {
    return {
      status: "ok",
      service: "wishtracker-api",
      timestamp: new Date().toISOString(),
    }
  }

  @Public()
  @Get("api/healthz")
  apiHealthz() {
    return {
      status: "ok",
      service: "wishtracker-api",
      timestamp: new Date().toISOString(),
    }
  }

  @Public()
  @Get("health")
  rootHealth() {
    return {
      status: "ok",
      service: "wishtracker-api",
      timestamp: new Date().toISOString(),
    }
  }

  @Public()
  @Get("healthz")
  healthz() {
    return {
      status: "ok",
      service: "wishtracker-api",
      timestamp: new Date().toISOString(),
    }
  }
}
