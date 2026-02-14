import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"

import configuration from "./config/configuration"
import { PrismaModule } from "./prisma/prisma.module"
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard"
import { TransformInterceptor } from "./common/interceptors/transform.interceptor"

import { AuthModule } from "./modules/auth/auth.module"
import { UsersModule } from "./modules/users/users.module"
import { WishlistsModule } from "./modules/wishlists/wishlists.module"
import { ItemsModule } from "./modules/items/items.module"
import { ReservationsModule } from "./modules/reservations/reservations.module"
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"
import { ScraperModule } from "./modules/scraper/scraper.module"
import { FriendsModule } from "./modules/friends/friends.module"
import { AppController } from "./app.controller"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 30 }], // 30 req/min default
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WishlistsModule,
    ItemsModule,
    ReservationsModule,
    SubscriptionsModule,
    NotificationsModule,
    ScraperModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
