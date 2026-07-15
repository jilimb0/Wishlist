import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
// ConfigService MUST be a value import (not type) for NestJS Dependency Injection to work
import { ConfigService } from "@nestjs/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log("Connected to database")
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
