import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { SubscriptionTier } from "@prisma/client"
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionTier: true,
        trialEndsAt: true,
        proExpiresAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const now = new Date()
    let trialEndsAt = user.trialEndsAt

    // Auto-grant 14 day trial if not set
    if (!trialEndsAt) {
      trialEndsAt = new Date(user.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
      await this.prisma.user.update({
        where: { id: userId },
        data: { trialEndsAt },
      })
    }

    const isTrialActive = trialEndsAt > now
    const isProExpired = user.proExpiresAt ? user.proExpiresAt > now : false
    const isPro = user.subscriptionTier === SubscriptionTier.PRO || isTrialActive || isProExpired

    const trialDaysRemaining = isTrialActive
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    return {
      tier: user.subscriptionTier,
      isPro,
      trialDaysRemaining,
      proExpiresAt: user.proExpiresAt?.toISOString() || null,
      features: {
        unlimitedPriceTracking: isPro,
        groupGifting: true, // Group gifting is accessible to all to foster virality
        customThemes: isPro,
        prioritySupport: isPro,
      },
    }
  }

  async activatePromo(userId: string, code: string) {
    const cleanCode = code.trim().toUpperCase()
    if (cleanCode !== "WISHTRACKERPRO" && cleanCode !== "GIFT2026") {
      throw new BadRequestException("Invalid promotional code")
    }

    const proExpiresAt = new Date()
    proExpiresAt.setFullYear(proExpiresAt.getFullYear() + 1)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: SubscriptionTier.PRO,
        proExpiresAt,
      },
    })

    return {
      success: true,
      message: "Pro subscription activated for 1 year!",
      proExpiresAt: proExpiresAt.toISOString(),
    }
  }

  async createCheckout(userId: string, plan: "MONTHLY" | "YEARLY") {
    // In production this connects to Stripe or CloudPayments session
    // For demo/staging we simulate successful instant checkout URL
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException("User not found")

    return {
      checkoutUrl: `/billing/success?plan=${plan}`,
      plan,
      amount: plan === "YEARLY" ? 39.99 : 4.99,
      currency: "USD",
    }
  }

  async confirmPayment(userId: string, plan: "MONTHLY" | "YEARLY") {
    const expiresAt = new Date()
    if (plan === "YEARLY") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: SubscriptionTier.PRO,
        proExpiresAt: expiresAt,
      },
    })

    return { success: true, proExpiresAt: expiresAt.toISOString() }
  }
}
