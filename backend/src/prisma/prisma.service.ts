import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>("database.url")
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log("Connected to database via Driver Adapter")
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
