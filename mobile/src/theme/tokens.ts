/**
 * Design System Tokens
 * Единая система дизайна для всего приложения
 */

// Цвета
export const colors = {
  // Основные
  background: {
    primary: "#0a0a0a",
    secondary: "#18181b",
    tertiary: "#27272a",
  },
  // Акцентные
  accent: {
    primary: "#fbbf24",
    secondary: "rgba(251, 191, 36, 0.1)",
  },
  // Текст
  text: {
    primary: "#ffffff",
    secondary: "#d4d4d8",
    tertiary: "#a1a1aa",
    quaternary: "#71717a",
    disabled: "#52525b",
  },
  // Границы
  border: {
    primary: "#27272a",
    secondary: "#3f3f46",
    tertiary: "#52525b",
  },
  // Статусы
  status: {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
} as const

// Отступы
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
} as const

// Радиусы скругления
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const

// Размеры шрифтов
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const

// Веса шрифтов
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const

// Высота строки
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const

// Тени
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
} as const

// Размеры иконок
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
  "3xl": 64,
} as const

// Высота элементов
export const height = {
  input: 44,
  button: 44,
  header: 56,
  tab: 56,
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
} as const

// Ширина
export const width = {
  full: "100%",
  screen: "100%",
} as const

// Прозрачность
export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  overlay: 0.6,
  glass: 0.75,
  glassLight: 0.65,
} as const

// Glass эффекты
export const glass = {
  // Интенсивность блюра
  intensity: {
    low: 30,
    medium: 40,
    high: 60,
    extraHigh: 80,
  },
  // Цвета фона с прозрачностью
  background: {
    primary: "rgba(24, 24, 27, 0.75)",
    secondary: "rgba(24, 24, 27, 0.65)",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
  // Границы
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    light: "rgba(255, 255, 255, 0.08)",
    medium: "rgba(255, 255, 255, 0.1)",
  },
  // Handle для модалок
  handle: "rgba(255, 255, 255, 0.2)",
} as const

// Длительность анимаций
export const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const
