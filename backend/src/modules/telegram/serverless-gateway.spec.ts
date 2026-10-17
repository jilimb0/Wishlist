import { handleWishlistServerlessWebhook } from "./serverless-gateway"

describe("WishlistServerlessWebhook", () => {
  const env = {
    TELEGRAM_BOT_TOKEN: "fake-bot-token",
    TELEGRAM_WEBHOOK_SECRET: "my-secret-token",
    BACKEND_API_URL: "https://api.example.com",
  }

  it("returns 200 for /health route", async () => {
    const req = new Request("https://worker.test/health", { method: "GET" })
    const res = await handleWishlistServerlessWebhook(req, env)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it("returns 405 for non-POST requests to webhook", async () => {
    const req = new Request("https://worker.test/webhook", { method: "GET" })
    const res = await handleWishlistServerlessWebhook(req, env)
    expect(res.status).toBe(405)
  })

  it("returns 401 when secret token is missing or mismatched", async () => {
    const req = new Request("https://worker.test/webhook", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "wrong-token" },
      body: JSON.stringify({ update_id: 123 }),
    })
    const res = await handleWishlistServerlessWebhook(req, env)
    expect(res.status).toBe(401)
  })
})
