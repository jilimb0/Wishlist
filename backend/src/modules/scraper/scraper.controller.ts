import { Body, Controller, Post } from "@nestjs/common"
// biome-ignore lint/style/useImportType: validation requirement
import { ScrapeDto } from "./dto/scrape.dto"
// biome-ignore lint/style/useImportType: DI requirement
import { ScraperService } from "./scraper.service"

@Controller("api/scrape")
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  async scrape(@Body() dto: ScrapeDto) {
    return this.scraperService.scrape(dto.url)
  }
}
