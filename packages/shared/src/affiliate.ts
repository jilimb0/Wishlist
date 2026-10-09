export type AffiliateMerchant = "AMAZON" | "OZON" | "WILDBERRIES" | "OTHER"

export interface AffiliateConfig {
  amazonTag?: string
  ozonPartner?: string
  wbPartner?: string
}

const DEFAULT_CONFIG: AffiliateConfig = {
  amazonTag: "wishtracker-20",
  ozonPartner: "wishtracker",
  wbPartner: "wishtracker",
}

export function detectMerchant(rawUrl: string): AffiliateMerchant {
  try {
    const url = new URL(rawUrl)
    const host = url.hostname.toLowerCase()
    if (host.includes("amazon.") || host === "amzn.to" || host === "amzn.eu") {
      return "AMAZON"
    }
    if (host.includes("ozon.ru")) {
      return "OZON"
    }
    if (host.includes("wildberries.ru") || host.includes("wb.ru")) {
      return "WILDBERRIES"
    }
    return "OTHER"
  } catch {
    return "OTHER"
  }
}

export function generateAffiliateUrl(
  rawUrl: string,
  config: AffiliateConfig = DEFAULT_CONFIG,
): string {
  try {
    const url = new URL(rawUrl)
    const merchant = detectMerchant(rawUrl)

    if (merchant === "AMAZON" && config.amazonTag) {
      url.searchParams.set("tag", config.amazonTag)
      return url.toString()
    }

    if (merchant === "OZON" && config.ozonPartner) {
      url.searchParams.set("partner", config.ozonPartner)
      return url.toString()
    }

    if (merchant === "WILDBERRIES" && config.wbPartner) {
      url.searchParams.set("utm_source", "wishtracker")
      url.searchParams.set("utm_medium", "affiliate")
      return url.toString()
    }

    return rawUrl
  } catch {
    return rawUrl
  }
}
