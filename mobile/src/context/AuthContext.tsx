import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { api } from "../lib/api"
import type { User } from "../types"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    async function loadAuth() {
      try {
        const storedToken = await AsyncStorage.getItem("token")
        if (storedToken) {
          setToken(storedToken)
          api.setToken(storedToken) // Ensure API client has the token
          try {
            const userData = await api.get<User>("/users/me")
            setUser(userData)
          } catch (e) {
            console.error("Failed to fetch user", e)
            // Token might be invalid
            await api.setToken(null)
            setToken(null)
          }
        }
      } catch (e) {
        console.error("Failed to load auth state", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  const login = useCallback((newToken: string, newUser: User) => {
    api.setToken(newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    api.post("/auth/logout").catch(() => {})
    api.setToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
