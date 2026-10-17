import { Test, type TestingModule } from "@nestjs/testing"
import { AppController } from "./app.controller"

describe("AppController", () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe("health probes", () => {
    it("returns status ok on healthz()", () => {
      const result = appController.healthz()
      expect(result.status).toBe("ok")
      expect(result.service).toBe("wishtracker-api")
      expect(result.timestamp).toBeDefined()
    })

    it("returns status ok on rootHealth()", () => {
      const result = appController.rootHealth()
      expect(result.status).toBe("ok")
      expect(result.service).toBe("wishtracker-api")
    })

    it("returns status ok on health()", () => {
      const result = appController.health()
      expect(result.status).toBe("ok")
    })
  })
})
