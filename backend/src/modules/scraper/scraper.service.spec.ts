import { BadRequestException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import axios from "axios"
import { resetScraperState, ScraperService } from "./scraper.service"

jest.mock("axios")

describe("ScraperService", () => {
  let service: ScraperService

  beforeEach(async () => {
    resetScraperState()
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile()

    service = module.get(ScraperService)
    jest.clearAllMocks()
  })

  it("rejects non-http protocols", async () => {
    await expect(service.scrape("ftp://example.com/file")).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it("blocks localhost IP addresses and hostnames", async () => {
    await expect(service.scrape("http://127.0.0.1/admin")).rejects.toBeInstanceOf(
      BadRequestException,
    )
    await expect(service.scrape("http://localhost:3000/")).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it("blocks private network IPs and cloud metadata endpoints", async () => {
    await expect(service.scrape("http://192.168.0.1/")).rejects.toBeInstanceOf(BadRequestException)
    await expect(service.scrape("http://10.0.0.1/")).rejects.toBeInstanceOf(BadRequestException)
    await expect(service.scrape("http://169.254.169.254/latest/meta-data")).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it("parses Amazon product pages with price and image", async () => {
    const mockHtml = `
      <html>
        <head>
          <title>Test Page</title>
          <meta property="og:image" content="https://m.media-amazon.com/images/I/test.jpg" />
        </head>
        <body>
          <span id="productTitle">Sony WH-1000XM5 Wireless Headphones</span>
          <span class="a-price"><span class="a-offscreen">$399.99</span></span>
        </body>
      </html>
    `
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockHtml })

    const result = await service.scrape("https://www.amazon.com/dp/B09XS7JWHH")
    expect(result.title).toBe("Sony WH-1000XM5 Wireless Headphones")
    expect(result.price).toBe(399.99)
    expect(result.currency).toBe("USD")
    expect(result.imageUrl).toBe("https://m.media-amazon.com/images/I/test.jpg")
  })

  it("parses Ozon product pages with finalPrice and meta", async () => {
    const mockHtml = `
      <html>
        <head>
          <meta property="og:title" content="Кофемашина DeLonghi - купить в интернет-магазине OZON" />
          <meta property="og:image" content="https://cdn1.ozone.ru/test.jpg" />
        </head>
        <body>
          <script>"finalPrice": 45990</script>
        </body>
      </html>
    `
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockHtml })

    const result = await service.scrape("https://www.ozon.ru/product/delonghi-123456/")
    expect(result.title).toBe("Кофемашина DeLonghi")
    expect(result.price).toBe(45990)
    expect(result.currency).toBe("RUB")
    expect(result.imageUrl).toBe("https://cdn1.ozone.ru/test.jpg")
  })

  it("parses Wildberries products via WB API", async () => {
    const mockWbResponse = {
      data: {
        products: [
          {
            id: 12345678,
            name: "Кроссовки мужские",
            brand: "Nike",
            salePriceU: 899000,
            priceU: 1200000,
          },
        ],
      },
    }
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockWbResponse })

    const result = await service.scrape("https://www.wildberries.ru/catalog/12345678/detail.aspx")
    expect(result.title).toBe("Nike Кроссовки мужские")
    expect(result.price).toBe(8990)
    expect(result.currency).toBe("RUB")
    expect(result.imageUrl).toContain("12345678")
  })

  it("serves repeated requests from in-memory cache without hitting network again", async () => {
    const mockHtml = `
      <html>
        <head><title>Cached Headphones</title></head>
        <body><span id="productTitle">Cached Headphones</span></body>
      </html>
    `
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockHtml })

    const url = "https://www.amazon.com/dp/B000000001"
    const firstResult = await service.scrape(url)
    expect(firstResult.title).toBe("Cached Headphones")
    expect(axios.get).toHaveBeenCalledTimes(1)

    // Second call for the same URL must come from cache
    const secondResult = await service.scrape(url)
    expect(secondResult).toEqual(firstResult)
    expect(axios.get).toHaveBeenCalledTimes(1) // Still 1!
  })

  it("trips Circuit Breaker after 3 consecutive failures and blocks further requests", async () => {
    ;(axios.get as jest.Mock).mockRejectedValue(new Error("503 Service Unavailable"))

    const failUrl1 = "https://www.broken-shop.com/item1"
    const failUrl2 = "https://www.broken-shop.com/item2"
    const failUrl3 = "https://www.broken-shop.com/item3"
    const failUrl4 = "https://www.broken-shop.com/item4"

    await expect(service.scrape(failUrl1)).rejects.toThrow("503 Service Unavailable")
    await expect(service.scrape(failUrl2)).rejects.toThrow("503 Service Unavailable")
    await expect(service.scrape(failUrl3)).rejects.toThrow("503 Service Unavailable")

    // 4th call should immediately fail with Circuit Breaker OPEN without touching axios
    await expect(service.scrape(failUrl4)).rejects.toThrow(/Circuit Breaker OPEN/)
    expect(axios.get).toHaveBeenCalledTimes(3)
  })
})
