import { join } from "node:path"
import { Logger, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import helmet from "helmet"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log"],
  })
  const configService = app.get(ConfigService)
  const logger = new Logger("Bootstrap")

  app.use(helmet())

  const origins = configService.get<string[]>("corsOrigins") || []
  const nodeEnv = configService.get<string>("nodeEnv")
  app.enableCors({
    origin: nodeEnv === "production" ? origins : true,
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter())

  // Serve static files from 'uploads' directory
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
  logger.log(`WishTracker API running on http://localhost:${port}`)
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`)
}

bootstrap()
