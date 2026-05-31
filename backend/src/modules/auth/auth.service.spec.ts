import { ConflictException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Test, type TestingModule } from "@nestjs/testing"
import { FriendsService } from "../friends/friends.service"
import { MailService } from "../mail/mail.service"
import { PrismaService } from "../../prisma/prisma.service"
import { AuthService } from "./auth.service"

describe("AuthService", () => {
  let service: AuthService
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }
  const jwtService = {
    sign: jest.fn().mockReturnValue("test-jwt"),
  }
  const mailService = { send: jest.fn().mockResolvedValue(undefined) }
  const configService = {
    get: jest.fn((key: string) => {
      if (key === "appUrl") return "http://localhost:3011"
      if (key === "nodeEnv") return "test"
      return undefined
    }),
  }
  const friendsService = { redeemInvitation: jest.fn().mockResolvedValue({ success: true }) }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
        { provide: ConfigService, useValue: configService },
        { provide: FriendsService, useValue: friendsService },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  describe("register", () => {
    it("throws ConflictException when email is already registered", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "existing-user" })

      await expect(
        service.register({
          email: "taken@example.com",
          password: "password123",
          displayName: "Taken User",
        }),
      ).rejects.toBeInstanceOf(ConflictException)

      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it("creates user and returns token when email is available", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: "new-user-id",
        email: "new@example.com",
        displayName: "New User",
        avatarUrl: null,
        createdAt: new Date(),
      })

      const result = await service.register({
        email: "New@Example.com",
        password: "password123",
        displayName: "New User",
      })

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "new@example.com" },
      })
      expect(result.token).toBe("test-jwt")
      expect(result.user.email).toBe("new@example.com")
    })
  })
})
