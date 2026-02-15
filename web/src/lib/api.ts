const API_BASE = "/api"

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem("token")
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      this.setToken(null)
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Request failed: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint)
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    const isFormData = data instanceof FormData
    const headers = options?.headers || {}

    // If FormData, let the browser set the Content-Type
    if (isFormData) {
      // @ts-ignore
      headers["Content-Type"] = undefined
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
      ...options,
      headers: isFormData ? headers : { ...headers },
    })
  }

  patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const api = new ApiClient()
