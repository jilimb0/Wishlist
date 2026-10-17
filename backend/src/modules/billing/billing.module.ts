import { Module } from "@nestjs/common" /* [UDPA-GUARD: sec-webhook-idempotency] */
import { PrismaModule } from "../../prisma/prisma.module"
import { BillingController } from "./billing.controller"
import { BillingService } from "./billing.service"

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
