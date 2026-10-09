import { describe, expect, it } from "vitest"
import {
  detectMerchant,
  generateAffiliateUrl,
  ItemStatus,
  NotificationType,
  Privacy,
  SubscriptionTier,
} from "./index"

describe("@wishtracker/shared", () => {
  it("exports privacy enum values matching API", () => {
    expect(Privacy.PUBLIC).toBe("PUBLIC")
    expect(Privacy.FRIENDS).toBe("FRIENDS")
    expect(Privacy.PRIVATE).toBe("PRIVATE")
  })

  it("exports notification and item status enums", () => {
    expect(NotificationType.PRICE_DROP).toBe("PRICE_DROP")
    expect(NotificationType.GROUP_GIFT_CONTRIBUTION).toBe("GROUP_GIFT_CONTRIBUTION")
    expect(ItemStatus.ACTIVE).toBe("ACTIVE")
    expect(ItemStatus.COMPLETED).toBe("COMPLETED")
    expect(SubscriptionTier.PRO).toBe("PRO")
  })

  it("detects merchants correctly", () => {
    expect(detectMerchant("https://www.amazon.com/dp/B08N5WRWNW")).toBe("AMAZON")
    expect(detectMerchant("https://www.ozon.ru/product/12345/")).toBe("OZON")
    expect(detectMerchant("https://www.wildberries.ru/catalog/12345/detail.aspx")).toBe(
      "WILDBERRIES",
    )
    expect(detectMerchant("https://example.com/item")).toBe("OTHER")
  })

  it("generates affiliate links with proper tags", () => {
    const amazon = generateAffiliateUrl("https://www.amazon.com/dp/B08N5WRWNW", {
      amazonTag: "mycustomtag-20",
    })
    expect(amazon).toContain("tag=mycustomtag-20")

    const ozon = generateAffiliateUrl("https://www.ozon.ru/product/12345/", {
      ozonPartner: "ozonpartner123",
    })
    expect(ozon).toContain("partner=ozonpartner123")

    const wb = generateAffiliateUrl("https://www.wildberries.ru/catalog/12345/detail.aspx")
    expect(wb).toContain("utm_source=wishtracker")
  })
})
