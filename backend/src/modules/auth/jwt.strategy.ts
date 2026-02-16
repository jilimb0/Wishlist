import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
// biome-ignore lint/style/useImportType: DI requirement
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"

export interface JwtPayload {
  sub: string
  email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret")!,
    })
  }

  private readonly logger = new Logger(JwtStrategy.name)

  /**
   * Validates the JWT payload and fetches the associated user.
   * This method is automatically called by the AuthGuard.
   *
   * @param payload Decoded JWT payload containing 'sub' (userId) and 'email'
   * @returns User object if valid, throws UnauthorizedException otherwise
   */
  async validate(payload: JwtPayload) {
    this.logger.warn(`[STRATEGY] Validating token payload: ${JSON.stringify(payload)}`)
    const { sub, email: _email } = payload

    if (!sub) {
      this.logger.error(`[STRATEGY] Token missing 'sub' claim!`)
      throw new UnauthorizedException("Invalid token payload")
    }

    this.logger.warn(`[STRATEGY] Looking up user by ID: ${sub}`)
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, email: true, displayName: true, avatarUrl: true },
    })

    if (user) {
      this.logger.warn(`[STRATEGY] User found: ${user.email} (${user.id})`)
    } else {
      this.logger.error(`[STRATEGY] User NOT FOUND for ID: ${sub}`)
    }

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return user
  }
}
