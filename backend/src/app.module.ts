import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { ScheduleModule } from "@nestjs/schedule"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"

import { JwtAuthGuard } from "./common/guards/jwt-auth.guard"
import { TransformInterceptor } from "./common/interceptors/transform.interceptor"
import configuration from "./config/configuration"
import { PrismaModule } from "./prisma/prisma.module"

import { AppController } from "./app.controller"
import { AuthModule } from "./modules/auth/auth.module"
import { FriendsModule } from "./modules/friends/friends.module"
import { MailModule } from "./modules/mail/mail.module"
import { PriceTrackingModule } from "./modules/price-tracking/price-tracking.module"
import { ItemsModule } from "./modules/items/items.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"
import { ReservationsModule } from "./modules/reservations/reservations.module"
import { ScraperModule } from "./modules/scraper/scraper.module"
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module"
import { UsersModule } from "./modules/users/users.module"
import { WishlistsModule } from "./modules/wishlists/wishlists.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 30 }], // 30 req/min default
    }),
    ScheduleModule.forRoot(),
    MailModule,
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
    PriceTrackingModule,
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
