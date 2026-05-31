import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"

// Configure via EXPO_PUBLIC_API_URL or mobile/app.config.js extra.apiUrl
// Android emulator: http://10.0.2.2:3010/api | iOS simulator: http://localhost:3010/api
const API_BASE =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3010/api"

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      console.log(`[API] ${options.method || "GET"} ${API_BASE}${endpoint}`)

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`[API] Response status: ${response.status}`)

      if (response.status === 401) {
        await this.setToken(null)
        throw new Error("Unauthorized")
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `Request failed: ${response.status}`)
      }

      return response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        console.error("[API] Request timeout")
        throw new Error("Request timeout - please check your connection")
      }

      console.error("[API] Request failed:", error.message)
      throw error
    }
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
