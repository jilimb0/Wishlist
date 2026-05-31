import { Module } from "@nestjs/common"
import { ScraperModule } from "../scraper/scraper.module"
import { PriceTrackingService } from "./price-tracking.service"

@Module({
  imports: [ScraperModule],
  providers: [PriceTrackingService],
})
export class PriceTrackingModule {}
