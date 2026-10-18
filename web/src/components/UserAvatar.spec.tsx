import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UserAvatar } from "./UserAvatar"

describe("UserAvatar", () => {
  it("renders image when avatarUrl is provided", () => {
    render(
      <UserAvatar
        user={{ displayName: "Alice Wonderland", avatarUrl: "https://example.com/avatar.jpg" }}
      />,
    )
    const img = screen.getByRole("img")
    expect(img).toBeDefined()
    expect(img.getAttribute("src")).toBe("https://example.com/avatar.jpg")
  })

  it("renders fallback initials when avatarUrl is missing", () => {
    render(<UserAvatar user={{ displayName: "Bob Marley" }} />)
    expect(screen.getByText("BM")).toBeDefined()
  })
})
