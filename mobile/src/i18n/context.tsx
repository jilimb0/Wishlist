import React, { createContext, useContext, useCallback } from "react"
import { translations } from "./translations"
import { useAuth } from "../context/AuthContext"

interface I18nContextType {
  language: string
  t: (key: string, params?: Record<string, string | number>) => string
  formatPrice: (amount: number, originalCurrency?: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

// Hardcoded conversion rates relative to USD
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.93, // 1 USD = 0.93 EUR
  RUB: 91.5, // 1 USD = 91.5 RUB
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  RUB: "₽",
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const language = user?.language || "en"
  const userCurrency = user?.currency || "USD"

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = translations[language] || translations["en"]
      let text = dict[key] || key

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{{${k}}}`, String(v))
        })
      }

      return text
    },
    [language],
  )

  const formatPrice = useCallback(
    (amount: number, originalCurrency: string = "USD") => {
      // 1. Convert to USD first (base)
      const amountInUSD = amount / (RATES[originalCurrency] || 1)

      // 2. Convert to User's Currency
      const targetRate = RATES[userCurrency] || 1
      const finalAmount = amountInUSD * targetRate

      // Format based on currency - React Native supports Intl.NumberFormat
      // Hermes engine includes Intl support by default in recent versions
      return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: userCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(finalAmount)
    },
    [userCurrency, language],
  )

  return (
    <I18nContext.Provider value={{ language, t, formatPrice }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
