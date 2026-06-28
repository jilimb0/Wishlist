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
   * Includes SSRF protection to block access to internal/private network addresses.
   *
   * @param url The URL to scrape
   * @returns ScrapeResult containing title, price, currency, image, and description
   * @throws BadRequestException if URL is invalid, non-HTTP(S), or blocked by SSRF list
   */
  async scrape(url: string): Promise<ScrapeResult> {
    const parsedUrl = this.validateUrl(url)
    await this.protectAgainstSsrf(parsedUrl.hostname)

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      const html = response.data
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
      const price =
        jsonLd?.price || this.parsePrice(this.extractMeta(html, "product:price:amount")) || null
      const currency = jsonLd?.currency || this.extractMeta(html, "product:price:currency") || "USD"

      return {
        title: title.trim(),
        price,
        currency,
        imageUrl,
        description: description?.trim() || null,
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
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
    // 1. Check if hostname is an IP
    if (isIP(hostname)) {
      if (this.isPrivateIp(hostname)) {
        throw new BadRequestException("Access to internal network is blocked")
      }
      return
    }

    // 2. Resolve hostname to IP
    try {
      const { address } = await lookup(hostname)
      if (this.isPrivateIp(address)) {
        throw new BadRequestException("Access to internal network is blocked")
      }
    } catch (_e) {
      // If DNS resolution fails, let axios handle it (likely invalid host)
    }
  }

  private isPrivateIp(ip: string): boolean {
    const parts = ip.split(".").map(Number)
    if (parts[0] === 10) return true // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true // 192.168.0.0/16
    if (parts[0] === 127) return true // 127.0.0.0/8
    if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true // IPv6 localhost
    return false
  }

  private extractMeta(html: string, property: string): string | null {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    )
    const match = html.match(regex)
    if (match) return match[1]

    // Try reverse order of attributes
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

  private parsePrice(priceStr: string | null): number | null {
    if (!priceStr) return null
    const cleaned = priceStr.replace(/[^\d.]/g, "")
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
      // Ignore outer errors
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
