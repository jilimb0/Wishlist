import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "../../prisma/prisma.module"
import { AffiliateController } from "./affiliate.controller"
import { AffiliateService } from "./affiliate.service"

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
