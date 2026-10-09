import { Module } from "@nestjs/common"
import { ScraperModule } from "../scraper/scraper.module"
import { TelegramModule } from "../telegram/telegram.module"
import { PriceTrackingService } from "./price-tracking.service"

@Module({
  imports: [ScraperModule, TelegramModule],
  providers: [PriceTrackingService],
})
export class PriceTrackingModule {}
