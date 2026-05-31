import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
// biome-ignore lint/style/useImportType: DI requirement
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
// biome-ignore lint/style/useImportType: DI requirement
import { FriendsService } from "../friends/friends.service"
// biome-ignore lint/style/useImportType: DI requirement
import { MailService } from "../mail/mail.service"
// biome-ignore lint/style/useImportType: DI requirement
import { PrismaService } from "../../prisma/prisma.service"
// biome-ignore lint/style/useImportType: validation requirement
import { LoginDto, RegisterDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mail: MailService,
    private config: ConfigService,
    private friendsService: FriendsService,
  ) {}

  private readonly logger = new Logger(AuthService.name)

  async register(dto: RegisterDto) {
    this.logger.warn(`[REGISTER] Attempting registration for: ${dto.email}`)
    const email = dto.email.toLowerCase()

    const existing = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      this.logger.warn(`[REGISTER] Email already exists: ${email}`)
      throw new ConflictException("Email already registered")
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (dto.inviteToken) {
      await this.friendsService.redeemInvitation(user.id, email, dto.inviteToken)
    }

    const token = this.generateToken(user.id, user.email)
    this.logger.log(`Registered user: ${user.email} (ID: ${user.id})`)
    return { user, token }
  }

  async login(dto: LoginDto) {
    this.logger.warn(`[LOGIN] Attempting login for: ${dto.email}`)
    const email = dto.email.toLowerCase()

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      this.logger.warn(`[LOGIN] User not found: ${email}`)
      throw new UnauthorizedException("User not found. Please register.")
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      this.logger.warn(`[LOGIN] Invalid password for: ${email}`)
      throw new UnauthorizedException("Wrong password")
    }

    this.logger.warn(`[LOGIN] Password valid. Generating token for ID: ${user.id}`)

    const token = this.generateToken(user.id, user.email)
    this.logger.log(`Logged in user: ${user.email} (ID: ${user.id})`)
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    }
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email })
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user doesn't exist
      return { message: "If email exists, reset instructions sent." }
    }

    // Generate simple token (random string)
    const resetToken =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    // Expires in 1 hour
    const resetTokenExpires = new Date(Date.now() + 3600000)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    const appUrl = this.config.get<string>("appUrl") || "http://localhost:3011"
    const link = `${appUrl}/reset-password?token=${resetToken}`

    await this.mail.send({
      to: user.email,
      subject: "Reset your WishTracker password",
      html: `<p>Reset your password:</p><p><a href="${link}">${link}</a></p>`,
      text: `Reset password: ${link}`,
    })

    if (this.config.get<string>("nodeEnv") === "development") {
      this.logger.debug(`[PASSWORD RESET] Dev link for ${email}: ${link}`)
    }

    return { message: "If email exists, reset instructions sent." }
  }

  async resetPassword(dto: { token: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException("Invalid or expired token")
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    this.logger.log(`Password reset successfully for user: ${user.email}`)

    return { message: "Password reset successful" }
  }

  async changePassword(userId: string, dto: { oldPassword?: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) throw new UnauthorizedException("User not found")

    // If user has a password set, strictly verify old password
    if (user.passwordHash) {
      if (!dto.oldPassword) {
        throw new BadRequestException("Current password is required")
      }
      const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash)
      if (isPasswordValid) {
        if (dto.oldPassword === dto.newPassword) {
          throw new BadRequestException("New password must be different from current password")
        }
      } else {
        throw new BadRequestException("Invalid current password")
      }
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { message: "Password updated successfully" }
  }
}
