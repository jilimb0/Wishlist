import { describe, it, expect, vi, beforeEach } from "vitest"

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe("ApiClient", () => {
  it("manages token in localStorage", async () => {
    const { api } = await import("./api")
    api.setToken("test-token")
    expect(localStorage.getItem("token")).toBe("test-token")
    expect(api.getToken()).toBe("test-token")
  })

  it("removes token on setToken(null)", async () => {
    const { api } = await import("./api")
    api.setToken("test-token")
    api.setToken(null)
    expect(localStorage.getItem("token")).toBeNull()
    expect(api.getToken()).toBeNull()
  })

  it("sends GET request with auth header", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "1", name: "test" }), { status: 200 }),
    )
    const { api } = await import("./api")
    api.setToken("secret")
    await api.get("/users/me")
    expect(fetch).toHaveBeenCalledWith("/api/users/me", {
      headers: expect.objectContaining({ Authorization: "Bearer secret" }),
    })
  })

  it("sends POST request with JSON body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    )
    const { api } = await import("./api")
    await api.post("/test", { foo: "bar" })
    expect(fetch).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
      body: JSON.stringify({ foo: "bar" }),
    })
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Not found" }), { status: 404 }),
    )
    const { api } = await import("./api")
    await expect(api.get("/not-found")).rejects.toThrow()
  })
})
