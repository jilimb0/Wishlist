// Scrape page metadata
function scrapePage() {
  const getMeta = (property: string) => {
    return (
      document.querySelector(`meta[property="${property}"]`)?.getAttribute("content") ||
      document.querySelector(`meta[name="${property}"]`)?.getAttribute("content")
    )
  }

  const title = getMeta("og:title") || getMeta("twitter:title") || document.title

  const description =
    getMeta("og:description") || getMeta("twitter:description") || getMeta("description")

  const image =
    getMeta("og:image") ||
    getMeta("twitter:image") ||
    getMeta("image") ||
    document.querySelector('[itemprop="image"]')?.getAttribute("content") ||
    document.querySelector('link[rel="image_src"]')?.getAttribute("href") ||
    document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
    document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
    document.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
    document.querySelector('img[class*="logo"]')?.getAttribute("src") ||
    document.querySelector('img[id*="logo"]')?.getAttribute("src") ||
    document.querySelector('img[alt*="logo"]')?.getAttribute("src")

  const url = window.location.href

  // Try to find price
  let price: string | undefined | null = null
  let currency: string | undefined | null = null
  const priceMeta = getMeta("og:price:amount") || getMeta("product:price:amount")
  const currencyMeta = getMeta("og:price:currency") || getMeta("product:price:currency")

  if (priceMeta) price = Number.parseFloat(priceMeta)
  if (currencyMeta) currency = currencyMeta

  // JSON-LD fallback
  if (!price) {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent || "{}")
        const offer = data.offers || data.Offers
        if (offer) {
          const p = offer.price || offer.lowPrice
          const c = offer.priceCurrency
          if (p) {
            price = Number.parseFloat(p)
            currency = c || "USD"
            break
          }
        }
      } catch (_e) {
        // ignore
      }
    }
  }

  return { title, description, image, url, price, currency }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "scrape") {
    sendResponse(scrapePage())
  }
  return true // keep message channel open for async responses
})
