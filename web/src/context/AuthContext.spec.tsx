import { render, screen } from "@testing-library/react"
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "../lib/api"
import { AuthProvider, useAuth } from "./AuthContext"

function TestConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="user">{auth.user?.displayName || "no user"}</span>
      <span data-testid="token">{auth.token || "none"}</span>
      <span data-testid="loading">{auth.isLoading ? "loading" : "done"}</span>
    </div>
  )
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    api.setToken(null)
  })

  it("shows no user when no token", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId("user").textContent).toBe("no user")
    expect(screen.getByTestId("token").textContent).toBe("none")
    expect(screen.getByTestId("loading").textContent).toBe("done")
  })

  it("provides working login and logout via context", () => {
    let capturedAuth: Record<string, unknown> | null = null
    function CaptureConsumer() {
      const auth = useAuth()
      capturedAuth = auth
      return <div data-testid="capture">OK</div>
    }

    render(
      <AuthProvider>
        <CaptureConsumer />
      </AuthProvider>,
    )

    expect(capturedAuth).not.toBeNull()
    expect(typeof capturedAuth.login).toBe("function")
    expect(typeof capturedAuth.logout).toBe("function")
    expect(typeof capturedAuth.updateUser).toBe("function")
  })

  it("throws useAuth outside provider", () => {
    function BadConsumer() {
      useAuth()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow("useAuth must be used within AuthProvider")
  })
})
