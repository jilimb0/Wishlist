import { Body, Controller, Post } from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import { ScrapeDto } from "./dto/scrape.dto"
import { ScraperService } from "./scraper.service"

@Controller("api/scrape")
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url)
  }
}
