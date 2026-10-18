import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { ProtectedRoute } from "./ProtectedRoute"

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from "../context/AuthContext"

describe("ProtectedRoute", () => {
  it("renders spinner when loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
    } as any)

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(container.querySelector(".animate-spin")).not.toBeNull()
  })

  it("renders children when user is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u-1", displayName: "Tester" },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText("Protected Content")).toBeDefined()
  })
})
