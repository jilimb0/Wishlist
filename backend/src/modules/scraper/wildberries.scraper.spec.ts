import axios from "axios"
import { getWildberriesBasket, scrapeWildberriesProduct } from "./wildberries.scraper"

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("Wildberries Scraper", () => {
  describe("getWildberriesBasket", () => {
    it("returns correct basket ranges", () => {
      expect(getWildberriesBasket(50)).toBe("01")
      expect(getWildberriesBasket(200)).toBe("02")
      expect(getWildberriesBasket(350)).toBe("03")
      expect(getWildberriesBasket(500)).toBe("04")
      expect(getWildberriesBasket(800)).toBe("05")
      expect(getWildberriesBasket(1050)).toBe("06")
      expect(getWildberriesBasket(1100)).toBe("07")
      expect(getWildberriesBasket(1150)).toBe("08")
      expect(getWildberriesBasket(1200)).toBe("09")
      expect(getWildberriesBasket(1400)).toBe("10")
      expect(getWildberriesBasket(1620)).toBe("11")
      expect(getWildberriesBasket(1800)).toBe("12")
      expect(getWildberriesBasket(2000)).toBe("13")
      expect(getWildberriesBasket(2100)).toBe("14")
      expect(getWildberriesBasket(2300)).toBe("15")
      expect(getWildberriesBasket(3000)).toBe("16")
    })
  })

  describe("scrapeWildberriesProduct", () => {
    it("returns null for non-catalog URLs", async () => {
      const res = await scrapeWildberriesProduct(new URL("https://wildberries.ru/promotions"))
      expect(res).toBeNull()
    })

    it("parses product details and constructs image URL correctly", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            products: [
              {
                id: 12345678,
                name: "Wireless Earbuds",
                brand: "Sony",
                salePriceU: 499000,
                description: "Hi-Res Audio",
              },
            ],
          },
        },
      })

      const res = await scrapeWildberriesProduct(
        new URL("https://www.wildberries.ru/catalog/12345678/detail.aspx"),
      )
      expect(res).not.toBeNull()
      expect(res?.title).toBe("Sony Wireless Earbuds")
      expect(res?.price).toBe(4990)
      expect(res?.currency).toBe("RUB")
      expect(res?.imageUrl).toContain("12345678")
    })
  })
})
