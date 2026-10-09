import { Test, type TestingModule } from "@nestjs/testing"
import { SubscriptionTier } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"
import { BillingService } from "./billing.service"

describe("BillingService", () => {
  let service: BillingService

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get(BillingService)
    jest.clearAllMocks()
  })

  it("calculates trial days remaining when trial is active", async () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      subscriptionTier: SubscriptionTier.FREE,
      trialEndsAt: futureDate,
      proExpiresAt: null,
      createdAt: new Date(),
    })

    const status = await service.getStatus("user-1")
    expect(status.isPro).toBe(true)
    expect(status.trialDaysRemaining).toBeGreaterThanOrEqual(4)
  })

  it("activates promo code successfully", async () => {
    mockPrisma.user.update.mockResolvedValueOnce({ id: "user-1" })

    const res = await service.activatePromo("user-1", "WISHTRACKERPRO")
    expect(res.success).toBe(true)
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subscriptionTier: SubscriptionTier.PRO,
        }),
      }),
    )
  })
})
