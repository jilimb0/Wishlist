import AsyncStorage from "@react-native-async-storage/async-storage"

// Replace with your actual backend URL.
// For Android Emulator use "http://10.0.2.2:3000/api"
// For iOS Simulator use "http://localhost:3000/api"
// Replace with your machine's IP address if testing on a real device
// or use a tunneling service like ngrok for external access.
const API_BASE = "http://192.168.100.7:3000/api"

class ApiClient {
  private token: string | null = null

  constructor() {
    this.loadToken()
  }

  async loadToken() {
    try {
      const token = await AsyncStorage.getItem("token")
      this.token = token
    } catch (e) {
      console.error("Failed to load token", e)
    }
  }

  async setToken(token: string | null) {
    this.token = token
    try {
      if (token) {
        await AsyncStorage.setItem("token", token)
      } else {
        await AsyncStorage.removeItem("token")
      }
    } catch (e) {
      console.error("Failed to save token", e)
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      await this.setToken(null)
      // Navigation to login should be handled by the AuthContext/Navigation state
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

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
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
