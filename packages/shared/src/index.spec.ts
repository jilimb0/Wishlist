import { describe, expect, it } from "vitest"
import { ItemStatus, NotificationType, Privacy } from "./index"

describe("@wishtracker/shared", () => {
  it("exports privacy enum values matching API", () => {
    expect(Privacy.PUBLIC).toBe("PUBLIC")
    expect(Privacy.FRIENDS).toBe("FRIENDS")
    expect(Privacy.PRIVATE).toBe("PRIVATE")
  })

  it("exports notification and item status enums", () => {
    expect(NotificationType.PRICE_DROP).toBe("PRICE_DROP")
    expect(ItemStatus.ACTIVE).toBe("ACTIVE")
    expect(ItemStatus.COMPLETED).toBe("COMPLETED")
  })
})
