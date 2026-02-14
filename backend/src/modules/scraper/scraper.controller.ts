import { Controller, Post, Body } from "@nestjs/common"
import { ScraperService } from "./scraper.service"
import { ScrapeDto } from "./dto/scrape.dto"

@Controller("api/scrape")
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url)
  }
}
