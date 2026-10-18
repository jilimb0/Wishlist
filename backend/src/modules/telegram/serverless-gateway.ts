export interface WishlistServerlessEnv {
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_WEBHOOK_SECRET?: string
  BACKEND_API_URL?: string
  BACKEND_WEBHOOK_KEY?: string
}

export async function handleWishlistServerlessWebhook(
  request: Request,
  env: WishlistServerlessEnv,
): Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, service: "wishlist-telegram-serverless" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET
  if (expectedSecret) {
    const receivedSecret =
      request.headers.get("x-telegram-bot-api-secret-token") ||
      request.headers.get("x-telegram-bot-secret-token")

    if (!receivedSecret || receivedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  try {
    const update = (await request.json()) as Record<string, unknown>

    // Forward to backend API if configured, otherwise handle directly or respond ok
    if (env.BACKEND_API_URL) {
      const backendUrl = `${env.BACKEND_API_URL.replace(/\/$/, "")}/telegram/webhook`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (expectedSecret) {
        headers["x-telegram-bot-api-secret-token"] = expectedSecret
      }
      if (env.BACKEND_WEBHOOK_KEY) {
        headers["x-backend-key"] = env.BACKEND_WEBHOOK_KEY
      }

      await fetch(backendUrl, {
        /* AbortSignal.timeout(10_000) */
        method: "POST",
        headers,
        body: JSON.stringify(update),
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
