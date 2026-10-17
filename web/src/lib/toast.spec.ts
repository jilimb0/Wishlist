import { describe, expect, it } from "vitest"
import { subscribeToasts, toast } from "./toast"

describe("toast utility", () => {
  it("subscribes and pushes toast items", () => {
    let capturedToasts: any[] = []
    const unsubscribe = subscribeToasts((t) => {
      capturedToasts = t
    })

    const id = toast.success("Successfully saved!")
    expect(id).toBeDefined()
    expect(capturedToasts.some((t) => t.message === "Successfully saved!")).toBe(true)

    toast.dismiss(id)
    expect(capturedToasts.some((t) => t.id === id)).toBe(false)
    unsubscribe()
  })

  it("pushes error and info toasts", () => {
    let capturedToasts: any[] = []
    const unsubscribe = subscribeToasts((t) => {
      capturedToasts = t
    })

    toast.error("Something went wrong")
    expect(capturedToasts.some((t) => t.variant === "error")).toBe(true)

    unsubscribe()
  })
})
