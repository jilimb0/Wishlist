import { join } from "node:path"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as Sentry from "@sentry/node"
import helmet from "helmet"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { PinoLogger } from "./common/logger"

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: !!process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
  })

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })

  app.useLogger(PinoLogger.create("WishTracker"))

  app.use(helmet())

  const configService = app.get(ConfigService)
  const origins = configService.get<string[]>("corsOrigins") || []
  const nodeEnv = configService.get<string>("nodeEnv")
  app.enableCors({
    origin: nodeEnv === "production" ? origins : true,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle("WishTracker API")
    .setDescription("Wishlist management API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api/docs", app, document)

  const port = configService.get<number>("port") || 3010
  await app.listen(port)
}
bootstrap()
