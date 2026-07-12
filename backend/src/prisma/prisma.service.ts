import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
// ConfigService MUST be a value import (not type) for NestJS Dependency Injection to work
import { ConfigService } from "@nestjs/config"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>("database.url")
    super({ datasources: { db: { url: databaseUrl } } })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log("Connected to database")
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
