import axios from "axios"
import type { ScrapeResult } from "./scraper.service"

const WB_BASKETS: Array<{ max: number; basket: string }> = [
  { max: 143, basket: "01" },
  { max: 287, basket: "02" },
  { max: 431, basket: "03" },
  { max: 719, basket: "04" },
  { max: 1007, basket: "05" },
  { max: 1061, basket: "06" },
  { max: 1115, basket: "07" },
  { max: 1169, basket: "08" },
  { max: 1313, basket: "09" },
  { max: 1601, basket: "10" },
  { max: 1655, basket: "11" },
  { max: 1919, basket: "12" },
  { max: 2045, basket: "13" },
  { max: 2189, basket: "14" },
  { max: 2405, basket: "15" },
]

export function getWildberriesBasket(vol: number): string {
  const match = WB_BASKETS.find((b) => vol <= b.max)
  return match?.basket ?? "16"
}

export async function scrapeWildberriesProduct(parsedUrl: URL): Promise<ScrapeResult | null> {
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

  const idNum = Number.parseInt(productId, 10)
  const vol = Math.floor(idNum / 100000)
  const part = Math.floor(idNum / 1000)
  const basket = getWildberriesBasket(vol)

  const imageUrl = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`

  return {
    title,
    price,
    currency: "RUB",
    imageUrl,
    description: product.description || `Артикул WB: ${productId}`,
  }
}
