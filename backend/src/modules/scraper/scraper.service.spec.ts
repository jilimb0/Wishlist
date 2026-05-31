import { BadRequestException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { ScraperService } from "./scraper.service"

describe("ScraperService", () => {
  let service: ScraperService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile()

    service = module.get(ScraperService)
  })

  it("rejects non-http protocols", async () => {
    await expect(service.scrape("ftp://example.com/file")).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it("blocks localhost IP addresses", async () => {
    await expect(service.scrape("http://127.0.0.1/admin")).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it("blocks private network IPs", async () => {
    await expect(service.scrape("http://192.168.0.1/")).rejects.toBeInstanceOf(BadRequestException)
  })
})
