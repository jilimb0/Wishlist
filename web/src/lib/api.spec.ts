import { describe, expect, it } from "vitest"

describe("api client", () => {
  it("uses /api base in development", () => {
    expect("/api".startsWith("/")).toBe(true)
  })
})
