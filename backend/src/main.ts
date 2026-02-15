import { join } from "node:path"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"
import { AppModule } from "./app.module"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Enable CORS for frontend clients
  app.enableCors({
    origin: true, // Allow all origins for development (e.g. mobile device on different IP)
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

  const configService = app.get(ConfigService)
  const port = configService.get<number>("port") || 3010

  await app.listen(port)
  console.log(`🚀 WishTracker API (LOCAL DEV INSTANCE) running on http://localhost:${port}`)
}

bootstrap()
