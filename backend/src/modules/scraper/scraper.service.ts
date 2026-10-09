import * as dns from "node:dns"
import { isIP } from "node:net"
import { promisify } from "node:util"
import { BadRequestException, Injectable } from "@nestjs/common"
import axios from "axios"

const lookup = promisify(dns.lookup)

export interface ScrapeResult {
  title: string
  price: number | null
  currency: string
  imageUrl: string | null
  description: string | null
}

@Injectable()
export class ScraperService {
  /**
   * Parses product metadata from a given URL.
   * Includes SSRF protection, marketplace-specific adapters (Amazon, Ozon, WB),
   * and fallback to standard OpenGraph/JSON-LD metadata.
   */
  async scrape(url: string): Promise<ScrapeResult> {
    const parsedUrl = this.validateUrl(url)
    await this.protectAgainstSsrf(parsedUrl.hostname)

    // Specialized adapter for Wildberries
    if (this.isWildberries(parsedUrl.hostname)) {
      try {
        const wbResult = await this.scrapeWildberries(url, parsedUrl)
        if (wbResult) return wbResult
      } catch {
        // Fall back to standard scraper on error
      }
    }

    try {
      const response = await axios.get(url, {
        timeout: 7000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      })

      const html = typeof response.data === "string" ? response.data : JSON.stringify(response.data)

      // Specialized adapter for Amazon HTML
      if (this.isAmazon(parsedUrl.hostname)) {
        const amazonResult = this.parseAmazonHtml(html, url)
        if (amazonResult) return amazonResult
      }

      // Specialized adapter for Ozon HTML
      if (this.isOzon(parsedUrl.hostname)) {
        const ozonResult = this.parseOzonHtml(html, url)
        if (ozonResult) return ozonResult
      }

      const title =
        this.extractMeta(html, "og:title") ||
        this.extractMeta(html, "twitter:title") ||
        this.extractTag(html, "title") ||
        "Untitled Product"

      let imageUrl =
        this.extractMeta(html, "og:image") ||
        this.extractMeta(html, "twitter:image") ||
        this.extractMeta(html, "image") ||
        this.extractMeta(html, "og:image:url") ||
        this.extractMeta(html, "og:image:secure_url") ||
        this.extractItemProp(html, "image") ||
        this.extractLinkHref(html, "image_src") ||
        this.extractLinkHref(html, "apple-touch-icon") ||
        this.extractLinkHref(html, "icon") ||
        this.extractLinkHref(html, "shortcut icon") ||
        this.extractLogo(html)

      if (imageUrl) {
        imageUrl = this.resolveUrl(url, imageUrl)
      }

      const description =
        this.extractMeta(html, "og:description") ||
        this.extractMeta(html, "twitter:description") ||
        this.extractMeta(html, "description")

      const jsonLd = this.extractJsonLdPrice(html)
      const rawPrice =
        jsonLd?.price ||
        this.parsePrice(this.extractMeta(html, "product:price:amount")) ||
        this.parsePrice(this.extractItemProp(html, "price"))

      const currency =
        jsonLd?.currency ||
        this.extractMeta(html, "product:price:currency") ||
        this.extractItemProp(html, "priceCurrency") ||
        this.detectCurrencyFromDomain(parsedUrl.hostname)

      return {
        title: title.trim(),
        price: rawPrice,
        currency: currency.toUpperCase(),
        imageUrl,
        description: description?.trim() || null,
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  private isWildberries(hostname: string): boolean {
    return hostname.includes("wildberries.ru") || hostname.includes("wb.ru")
  }

  private isAmazon(hostname: string): boolean {
    return hostname.includes("amazon.") || hostname === "amzn.to" || hostname === "amzn.eu"
  }

  private isOzon(hostname: string): boolean {
    return hostname.includes("ozon.ru")
  }

  private detectCurrencyFromDomain(hostname: string): string {
    if (hostname.endsWith(".ru") || hostname.includes("ozon") || hostname.includes("wildberries")) {
      return "RUB"
    }
    if (hostname.endsWith(".co.uk")) return "GBP"
    if (
      hostname.endsWith(".de") ||
      hostname.endsWith(".fr") ||
      hostname.endsWith(".it") ||
      hostname.endsWith(".es")
    ) {
      return "EUR"
    }
    return "USD"
  }

  private async scrapeWildberries(_rawUrl: string, parsedUrl: URL): Promise<ScrapeResult | null> {
    const idMatch = parsedUrl.pathname.match(/\/catalog\/(\d+)/)
    if (!idMatch) return null

    const productId = idMatch[1]
    const apiUrl = `https://card.wb.ru/cards/v1/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm=${productId}`

    const res = await axios.get(apiUrl, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    })

    const product = res.data?.data?.products?.[0]
    if (!product) return null

    const title =
      product.name || product.brand
        ? `${product.brand || ""} ${product.name || ""}`.trim()
        : `Wildberries Товар ${productId}`
    const priceKopecks = product.salePriceU || product.priceU
    const price = priceKopecks ? priceKopecks / 100 : null

    // Determine Wildberries basket host for images
    const idNum = Number.parseInt(productId, 10)
    const vol = Math.floor(idNum / 100000)
    const part = Math.floor(idNum / 1000)
    let basket = "01"
    if (vol >= 0 && vol <= 143) basket = "01"
    else if (vol >= 144 && vol <= 287) basket = "02"
    else if (vol >= 288 && vol <= 431) basket = "03"
    else if (vol >= 432 && vol <= 719) basket = "04"
    else if (vol >= 720 && vol <= 1007) basket = "05"
    else if (vol >= 1008 && vol <= 1061) basket = "06"
    else if (vol >= 1062 && vol <= 1115) basket = "07"
    else if (vol >= 1116 && vol <= 1169) basket = "08"
    else if (vol >= 1170 && vol <= 1313) basket = "09"
    else if (vol >= 1314 && vol <= 1601) basket = "10"
    else if (vol >= 1602 && vol <= 1655) basket = "11"
    else if (vol >= 1656 && vol <= 1919) basket = "12"
    else if (vol >= 1920 && vol <= 2045) basket = "13"
    else if (vol >= 2046 && vol <= 2189) basket = "14"
    else if (vol >= 2190 && vol <= 2405) basket = "15"
    else basket = "16"

    const imageUrl = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`

    return {
      title,
      price,
      currency: "RUB",
      imageUrl,
      description: product.description || `Артикул WB: ${productId}`,
    }
  }

  private parseAmazonHtml(html: string, url: string): ScrapeResult | null {
    // Title
    const titleMatch =
      html.match(/<span[^>]+id=["']productTitle["'][^>]*>([^<]+)<\/span>/i) ||
      html.match(/<h1[^>]+id=["']title["'][^>]*>([^<]+)<\/h1>/i)
    const title = (
      titleMatch ? titleMatch[1] : this.extractMeta(html, "og:title") || "Amazon Product"
    ).trim()

    // Price
    let price: number | null = null
    const priceOffscreenMatch = html.match(
      /<span[^>]+class=["'][^"']*a-price[^"']*["'][^>]*>[\s\S]*?<span[^>]+class=["'][^"']*a-offscreen[^"']*["']>([^<]+)<\/span>/i,
    )
    if (priceOffscreenMatch) {
      price = this.parsePrice(priceOffscreenMatch[1])
    }

    if (!price) {
      const priceBlockMatch = html.match(
        /<span[^>]+id=["'](?:priceblock_ourprice|priceblock_dealprice|price_inside_buybox)["'][^>]*>([^<]+)<\/span>/i,
      )
      if (priceBlockMatch) {
        price = this.parsePrice(priceBlockMatch[1])
      }
    }

    // Currency
    let currency = "USD"
    if (html.includes("£") || url.includes(".co.uk")) currency = "GBP"
    else if (
      html.includes("€") ||
      url.includes(".de") ||
      url.includes(".fr") ||
      url.includes(".it")
    )
      currency = "EUR"
    else if (html.includes("¥") || url.includes(".co.jp")) currency = "JPY"

    // Image
    let imageUrl = this.extractMeta(html, "og:image")
    const dynamicImageMatch = html.match(/data-a-dynamic-image=["'](\{[\s\S]*?\})["']/i)
    if (dynamicImageMatch) {
      try {
        const parsed = JSON.parse(dynamicImageMatch[1].replace(/&quot;/g, '"'))
        const firstKey = Object.keys(parsed)[0]
        if (firstKey) imageUrl = firstKey
      } catch {
        // ignore
      }
    }

    return {
      title,
      price,
      currency,
      imageUrl: imageUrl ? this.resolveUrl(url, imageUrl) : null,
      description: this.extractMeta(html, "description") || null,
    }
  }

  private parseOzonHtml(html: string, url: string): ScrapeResult | null {
    const jsonLd = this.extractJsonLdPrice(html)
    const title =
      this.extractMeta(html, "og:title") ||
      this.extractMeta(html, "title") ||
      this.extractTag(html, "title") ||
      "Товар Ozon"

    let price = jsonLd?.price || this.parsePrice(this.extractMeta(html, "product:price:amount"))

    if (!price) {
      // Regex for price in ozon data
      const ozonPriceMatch =
        html.match(/"finalPrice":\s*(\d+)/i) || html.match(/"price":\s*"(\d+)/i)
      if (ozonPriceMatch) {
        price = Number.parseFloat(ozonPriceMatch[1])
      }
    }

    const imageUrl = this.extractMeta(html, "og:image") || this.extractLinkHref(html, "image_src")

    return {
      title: title.replace(/ - купить в интернет-магазине OZON.*$/i, "").trim(),
      price: price || null,
      currency: "RUB",
      imageUrl: imageUrl ? this.resolveUrl(url, imageUrl) : null,
      description: this.extractMeta(html, "description") || null,
    }
  }

  private validateUrl(url: string): URL {
    try {
      const parsed = new URL(url)
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new BadRequestException("Only HTTP and HTTPS protocols are supported")
      }
      return parsed
    } catch (e) {
      if (e instanceof BadRequestException) throw e
      throw new BadRequestException("Invalid URL format")
    }
  }

  private async protectAgainstSsrf(hostname: string) {
    if (isIP(hostname)) {
      if (this.isPrivateIp(hostname)) {
        throw new BadRequestException("Access to internal network is blocked")
      }
      return
    }

    try {
      const { address } = await lookup(hostname)
      if (this.isPrivateIp(address)) {
        throw new BadRequestException("Access to internal network is blocked")
      }
    } catch (_e) {
      // DNS error handled downstream
    }
  }

  private isPrivateIp(ip: string): boolean {
    const parts = ip.split(".").map(Number)
    if (parts[0] === 10) return true
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
    if (parts[0] === 192 && parts[1] === 168) return true
    if (parts[0] === 127) return true
    if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true
    return false
  }

  private extractMeta(html: string, property: string): string | null {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    )
    const match = html.match(regex)
    if (match) return match[1]

    const regexRev = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    )
    const matchRev = html.match(regexRev)
    return matchRev ? matchRev[1] : null
  }

  private extractItemProp(html: string, property: string): string | null {
    const regex = new RegExp(`<[^>]+itemprop=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
    const match = html.match(regex)
    return match ? match[1] : null
  }

  private extractLinkHref(html: string, rel: string): string | null {
    const regex = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, "i")
    const match = html.match(regex)
    return match ? match[1] : null
  }

  private extractLogo(html: string): string | null {
    const regex =
      /<img[^>]+(?:class|id|alt)=["'][^"']*(?:logo|brand)[^"']*["'][^>]+src=["']([^"']+)["']/i
    const match = html.match(regex)
    return match ? match[1] : null
  }

  private extractTag(html: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i")
    const match = html.match(regex)
    return match ? match[1] : null
  }

  private parsePrice(priceStr: string | null | undefined): number | null {
    if (!priceStr) return null
    // Clean string keeping digits and decimal separator
    const cleaned = priceStr.replace(/[^\d.,]/g, "").replace(",", ".")
    const price = Number.parseFloat(cleaned)
    return Number.isNaN(price) ? null : price
  }

  private extractJsonLdPrice(html: string): { price: number; currency: string } | null {
    try {
      const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      let match = regex.exec(html)
      while (match !== null) {
        try {
          const data = JSON.parse(match[1])
          const offers = data.offers || data.mainEntity?.offers
          if (offers) {
            const price = Number.parseFloat(offers.price || offers.lowPrice)
            const currency = offers.priceCurrency
            if (!Number.isNaN(price) && currency) {
              return { price, currency }
            }
          }
        } catch (_e) {
          // Continue to next script tag
        }
        match = regex.exec(html)
      }
    } catch (_e) {
      // Ignore
    }
    return null
  }

  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href
    } catch (_e) {
      return relative
    }
  }
}
