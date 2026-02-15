import { type ExecutionContext, Injectable } from "@nestjs/common"
// biome-ignore lint/style/useImportType: DI requirement
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { IS_PUBLIC_KEY } from "../../modules/auth/public.decorator"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    try {
      const result = await super.canActivate(context)
      return result as boolean
    } catch (err) {
      if (isPublic) {
        return true
      }
      throw err
    }
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    // If we have a user, return it (whether public or private)
    if (user) return user

    // If no user, but the route is public, that's fine - return null
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return null as TUser
    }

    // Otherwise, execute default behavior (throws UnauthorizedException)
    return super.handleRequest(err, user, info, context)
  }
}
