// utils/tw-colors.ts
import { useColorScheme } from "react-native"
import colors from "tailwindcss/colors"

const defaultTailwindColors = colors

// Define all color values directly (no CSS variables for React Native)
const colorTokens = {
  // Light theme colors
  light: {
    // Base colors
    "background": "#ffffff",
    "background-secondary": "#f8fafc",
    "foreground": "#0f172a",

    // Cards and overlays
    "card-background": "#ffffff",
    "card-foreground": "#0f172a",
    "popover-background": "#ffffff",
    "popover-foreground": "#0f172a",

    // Primary brand colors
    "primary": "#0e4b76",
    "primary-foreground": "#ffffff",
    "primary-50": "#f0f7ff",
    "primary-100": "#e0f0ff",
    "primary-200": "#bae1ff",
    "primary-500": "#3b9eff",
    "primary-600": "#0e4b76",
    "primary-700": "#0a3d61",
    "primary-900": "#062a42",

    // Secondary colors
    "secondary": "#f1f5f9",
    "secondary-foreground": "#0e4b76",

    // Navigation specific colors
    "navigation-background": "#ffffff",
    "navigation-foreground": "#64748b",
    "navigation-active-background": "#0e4b76",
    "navigation-active-foreground": "#ffffff",
    "navigation-inactive-background": "transparent",
    "navigation-inactive-foreground": "#64748b",
    "navigation-border": "#e2e8f0",
    "navigation-shadow": "rgba(15, 23, 42, 0.08)",

    // Header colors
    "header-background": "#ffffff",
    "header-foreground": "#0f172a",
    "header-primary": "#f1f5f9",
    "header-primary-foreground": "#0e4b76",
    "header-accent": "#e2e8f0",
    "header-accent-foreground": "#0e4b76",
    "header-border": "#e2e8f0",

    // Sidebar colors
    "sidebar-background": "#ffffff",
    "sidebar-foreground": "#0f172a",
    "sidebar-primary": "#f1f5f9",
    "sidebar-primary-foreground": "#0e4b76",
    "sidebar-accent": "#e2e8f0",
    "sidebar-accent-foreground": "#0e4b76",
    "sidebar-border": "#e2e8f0",

    // Status colors
    "success": "#10b981",
    "success-foreground": "#ffffff",
    "warning": "#f59e0b",
    "warning-foreground": "#ffffff",
    "destructive": "#ef4444",
    "destructive-foreground": "#ffffff",

    // Utility colors
    "muted": "#f8fafc",
    "muted-foreground": "#64748b",
    "accent": "#f1f5f9",
    "accent-foreground": "#0f172a",
    "border": "#e2e8f0",
    "input": "#f8fafc",
    "ring": "#0e4b76",

    // Chart colors
    "chart-1": "#3b82f6",
    "chart-2": "#10b981",
    "chart-3": "#f59e0b",
    "chart-4": "#ef4444",
    "chart-5": "#8b5cf6",
    "chart-6": "#06b6d4",

    // Badge colors
    "badge-bg-1": "#dcfce7",
    "badge-bg-2": "#dbeafe",
    "badge-bg-3": "#fed7aa",
    "badge-bg-4": "#fce7f3",
    "badge-bg-5": "#fee2e2",
    "badge-fg-1": "#166534",
    "badge-fg-2": "#1e40af",
    "badge-fg-3": "#9a3412",
    "badge-fg-4": "#be185d",
    "badge-fg-5": "#dc2626",
  },

  // Dark theme colors
  dark: {
    // Base colors - Dark theme (soft black, not pure black)
    "background": "#1a1d23",
    "background-secondary": "#232830",
    "foreground": "#f1f5f9",

    // Cards and overlays
    "card-background": "#232830",
    "card-foreground": "#f1f5f9",
    "popover-background": "#2a2f38",
    "popover-foreground": "#f1f5f9",

    // Primary colors remain same for brand consistency
    "primary": "#0e4b76",
    "primary-foreground": "#ffffff",
    "primary-50": "#0a1421",
    "primary-100": "#0f1f2e",
    "primary-200": "#1a3347",
    "primary-500": "#4a90c2",
    "primary-600": "#0e4b76",
    "primary-700": "#0a3d61",
    "primary-900": "#062a42",

    // Secondary colors
    "secondary": "#374151",
    "secondary-foreground": "#d1d5db",

    // Navigation for dark theme
    "navigation-background": "#232830",
    "navigation-foreground": "#9ca3af",
    "navigation-active-background": "#0e4b76",
    "navigation-active-foreground": "#ffffff",
    "navigation-inactive-background": "transparent",
    "navigation-inactive-foreground": "#9ca3af",
    "navigation-border": "#374151",
    "navigation-shadow": "rgba(0, 0, 0, 0.3)",

    // Header for dark theme
    "header-background": "#1a1d23",
    "header-foreground": "#f1f5f9",
    "header-primary": "#374151",
    "header-primary-foreground": "#d1d5db",
    "header-accent": "#4b5563",
    "header-accent-foreground": "#f9fafb",
    "header-border": "#374151",

    // Sidebar for dark theme
    "sidebar-background": "#1a1d23",
    "sidebar-foreground": "#f1f5f9",
    "sidebar-primary": "#374151",
    "sidebar-primary-foreground": "#d1d5db",
    "sidebar-accent": "#4b5563",
    "sidebar-accent-foreground": "#f9fafb",
    "sidebar-border": "#374151",

    // Status colors for dark theme
    "success": "#10b981",
    "success-foreground": "#ffffff",
    "warning": "#f59e0b",
    "warning-foreground": "#ffffff",
    "destructive": "#ef4444",
    "destructive-foreground": "#ffffff",

    // Utility colors
    "muted": "#374151",
    "muted-foreground": "#9ca3af",
    "accent": "#4b5563",
    "accent-foreground": "#f9fafb",
    "border": "#374151",
    "input": "#374151",
    "ring": "#0e4b76",

    // Chart colors for dark theme
    "chart-1": "#60a5fa",
    "chart-2": "#34d399",
    "chart-3": "#fbbf24",
    "chart-4": "#f87171",
    "chart-5": "#a78bfa",
    "chart-6": "#22d3ee",

    // Badge colors for dark theme
    "badge-bg-1": "#166534",
    "badge-bg-2": "#1e40af",
    "badge-bg-3": "#9a3412",
    "badge-bg-4": "#be185d",
    "badge-bg-5": "#dc2626",
    "badge-fg-1": "#dcfce7",
    "badge-fg-2": "#dbeafe",
    "badge-fg-3": "#fed7aa",
    "badge-fg-4": "#fce7f3",
    "badge-fg-5": "#fee2e2",
  }
}

// Get nested color value from an object
const getNestedColorValue = (obj: any, path: string[]): string | undefined => {
  let current = obj

  for (const key of path) {
    if (current?.[key] === undefined) return undefined
    current = current[key]
  }

  return typeof current === "string" ? current : undefined
}

export const useTwColors = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const twColor = (colorClass: string): string => {
    // Clean the class (remove prefixes like text-, bg-, border-, etc.)
    const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")

    // Handle DEFAULT cases for main colors
    const colorKey =
      cleanColorClass === "primary" ? "primary" :
      cleanColorClass === "secondary" ? "secondary" :
      cleanColorClass === "accent" ? "accent" :
      cleanColorClass === "background" ? "background" :
      cleanColorClass === "card" ? "card-background" :
      cleanColorClass === "popover" ? "popover-background" :
      cleanColorClass === "muted" ? "muted" :
      cleanColorClass === "destructive" ? "destructive" :
      cleanColorClass === "success" ? "success" :
      cleanColorClass === "warning" ? "warning" :
      cleanColorClass

    // 1. Look in theme-specific colors first
    const currentTheme = isDark ? colorTokens.dark : colorTokens.light
    if (currentTheme[colorKey as keyof typeof currentTheme]) {
      return currentTheme[colorKey as keyof typeof currentTheme]
    }

    // 2. Look in default Tailwind colors
    const colorPath = cleanColorClass.split("-")
    const defaultColor = getNestedColorValue(defaultTailwindColors, colorPath)
    if (defaultColor) {
      return defaultColor
    }

    // 3. Handle common color names
    const commonColors: Record<string, string> = {
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
      green: "#22c55e",
      red: "#ef4444",
      blue: "#3b82f6",
      yellow: "#eab308",
      purple: "#a855f7",
      pink: "#ec4899",
      indigo: "#6366f1",
      gray: "#6b7280",
      slate: "#64748b",
      zinc: "#71717a",
      neutral: "#737373",
      stone: "#78716c",
    }

    if (commonColors[cleanColorClass]) {
      return commonColors[cleanColorClass]
    }

    // Fallback to primary color
    console.warn(`Color not found: ${colorClass}`)
    return isDark ? colorTokens.dark.primary : colorTokens.light.primary
  }

  return { 
    twColor, 
    colorScheme,
    isDark,
    // Expose color tokens for debugging
    colorTokens: isDark ? colorTokens.dark : colorTokens.light
  }
}

// Static version for use outside components
export const getStaticTwColor = (colorClass: string, isDarkMode = false): string => {
  const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")

  const colorKey =
    cleanColorClass === "primary" ? "primary" :
    cleanColorClass === "secondary" ? "secondary" :
    cleanColorClass === "accent" ? "accent" :
    cleanColorClass === "background" ? "background" :
    cleanColorClass === "card" ? "card-background" :
    cleanColorClass === "popover" ? "popover-background" :
    cleanColorClass === "muted" ? "muted" :
    cleanColorClass === "destructive" ? "destructive" :
    cleanColorClass === "success" ? "success" :
    cleanColorClass === "warning" ? "warning" :
    cleanColorClass

  const currentTheme = isDarkMode ? colorTokens.dark : colorTokens.light
  if (currentTheme[colorKey as keyof typeof currentTheme]) {
    return currentTheme[colorKey as keyof typeof currentTheme]
  }

  const colorPath = cleanColorClass.split("-")
  const defaultColor = getNestedColorValue(defaultTailwindColors, colorPath)
  if (defaultColor) {
    return defaultColor
  }

  const commonColors: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
    current: "currentColor",
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
    yellow: "#eab308",
    purple: "#a855f7",
    pink: "#ec4899",
    indigo: "#6366f1",
    gray: "#6b7280",
    slate: "#64748b",
    zinc: "#71717a",
    neutral: "#737373",
    stone: "#78716c",
  }

  if (commonColors[cleanColorClass]) {
    return commonColors[cleanColorClass]
  }

  return isDarkMode ? colorTokens.dark.primary : colorTokens.light.primary
}

// Debug helper
export const debugColors = () => {
  console.log("Light theme colors:", Object.keys(colorTokens.light))
  console.log("Dark theme colors:", Object.keys(colorTokens.dark))
  return colorTokens
}