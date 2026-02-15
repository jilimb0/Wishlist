import { Body, Controller, Post } from "@nestjs/common"
import type { ScrapeDto } from "./dto/scrape.dto"
import type { ScraperService } from "./scraper.service"

@Controller("api/scrape")
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url)
  }
}
