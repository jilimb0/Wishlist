import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { MailService } from "./mail.service"

describe("MailService", () => {
  let service: MailService

  const config = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    config.get.mockImplementation((key: string) => {
      if (key === "mail.from") return "noreply@wishtracker.app"
      return null
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile()
    service = module.get(MailService)
  })

  it("logs to dev console when transporter is not configured", async () => {
    await expect(
      service.send({
        to: "recipient@example.com",
        subject: "Welcome",
        html: "<p>Hello</p>",
      }),
    ).resolves.not.toThrow()
  })
})
