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
      let finalKey = key

      if (params && typeof params.count === "number") {
        const count = params.count
        if (language === "ru") {
          const mod10 = count % 10
          const mod100 = count % 100
          if (mod10 === 1 && mod100 !== 11) {
            finalKey = `${key}_one`
          } else if (
            mod10 >= 2 &&
            mod10 <= 4 &&
            (mod100 < 10 || mod100 >= 20)
          ) {
            finalKey = `${key}_few`
          } else {
            finalKey = `${key}_many`
          }
        } else {
          finalKey = count === 1 ? `${key}_one` : `${key}_other`
        }
      }

      let text = dict[finalKey] || dict[key] || key

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

      const symbol = CURRENCY_SYMBOLS[userCurrency] || userCurrency

      // Format based on currency
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
