import { useColorScheme } from "react-native"
import colors from "tailwindcss/colors"

const defaultTailwindColors = colors

// Define all color values directly (mirroring CSS custom properties)
const colorTokens = {
  // Light theme colors
  light: {
    // Base colors
    background: "#fdfdfe",
    "background-secondary": "#f8fafc",
    foreground: "#1e293b",

    // Cards and overlays
    "card-background": "#ffffff",
    "card-foreground": "#1e293b",
    "popover-background": "#ffffff",
    "popover-foreground": "#1e293b",

    // Primary brand colors - Basé sur #2d728f
    primary: "#2d728f",
    "primary-foreground": "#ffffff",
    "primary-50": "#f0f9ff",
    "primary-100": "#e0f2fe",
    "primary-200": "#bae6fd",
    "primary-500": "#0ea5e9",
    "primary-600": "#0284c7",
    "primary-700": "#0369a1",
    "primary-900": "#2d728f",

    // Secondary colors
    secondary: "#f0f9ff",
    "secondary-foreground": "#0369a1",

    // Navigation specific colors
    "navigation-background": "#ffffff",
    "navigation-foreground": "#64748b",
    "navigation-active-background": "#2d728f",
    "navigation-active-foreground": "#ffffff",
    "navigation-inactive-background": "transparent",
    "navigation-inactive-foreground": "#64748b",
    "navigation-border": "#e2e8f0",
    "navigation-shadow": "rgba(45, 114, 143, 0.08)",
    "navigation-shadow-style": "0 4px 12px rgba(45, 114, 143, 0.08)",

    // Header colors
    "header-background": "#ffffff",
    "header-foreground": "#1e293b",
    "header-primary": "#f0f9ff",
    "header-primary-foreground": "#2d728f",
    "header-accent": "#e2e8f0",
    "header-accent-foreground": "#0369a1",
    "header-border": "#e2e8f0",
    "header-shadow-style": "0 1px 3px rgba(30, 41, 59, 0.1)",

    // Sidebar colors
    "sidebar-background": "#ffffff",
    "sidebar-foreground": "#1e293b",
    "sidebar-primary": "#f0f9ff",
    "sidebar-primary-foreground": "#2d728f",
    "sidebar-accent": "#e2e8f0",
    "sidebar-accent-foreground": "#0369a1",
    "sidebar-border": "#e2e8f0",

    // Status colors
    success: "#10b981",
    "success-foreground": "#ffffff",
    warning: "#f59e0b",
    "warning-foreground": "#ffffff",
    destructive: "#ef4444",
    "destructive-foreground": "#ffffff",

    // Utility colors
    muted: "#f8fafc",
    "muted-foreground": "#64748b",
    accent: "#f0f9ff",
    "accent-foreground": "#0369a1",
    border: "#e2e8f0",
    input: "#f8fafc",
    ring: "#2d728f",

    // Chart colors (inchangés)
    "chart-1": "#3b82f6",
    "chart-2": "#10b981",
    "chart-3": "#f59e0b",
    "chart-4": "#ef4444",
    "chart-5": "#8b5cf6",
    "chart-6": "#06b6d4",

    // Badge colors (inchangés)
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
    // Base colors
    background: "#0f172a",
    "background-secondary": "#1e293b",
    foreground: "#f1f5f9",

    // Cards and overlays
    "card-background": "#1e293b",
    "card-foreground": "#f1f5f9",
    "popover-background": "#334155",
    "popover-foreground": "#f1f5f9",

    // Primary colors - Basé sur #2d728f
    primary: "#0ea5e9",
    "primary-foreground": "#ffffff",
    "primary-50": "#082f49",
    "primary-100": "#0c4a6e",
    "primary-200": "#075985",
    "primary-500": "#0ea5e9",
    "primary-600": "#0284c7",
    "primary-700": "#0369a1",
    "primary-900": "#2d728f",

    // Secondary colors
    secondary: "#0c4a6e",
    "secondary-foreground": "#bae6fd",

    // Navigation
    "navigation-background": "#1e293b",
    "navigation-foreground": "#94a3b8",
    "navigation-active-background": "#0ea5e9",
    "navigation-active-foreground": "#ffffff",
    "navigation-inactive-background": "transparent",
    "navigation-inactive-foreground": "#94a3b8",
    "navigation-border": "#475569",
    "navigation-shadow": "rgba(0, 0, 0, 0.25)",
    "navigation-shadow-style": "0 4px 12px rgba(0, 0, 0, 0.25)",

    // Header
    "header-background": "#0f172a",
    "header-foreground": "#f1f5f9",
    "header-primary": "#082f49",
    "header-primary-foreground": "#bae6fd",
    "header-accent": "#475569",
    "header-accent-foreground": "#cbd5e1",
    "header-border": "#475569",
    "header-shadow-style": "0 1px 3px rgba(0, 0, 0, 0.2)",

    // Sidebar
    "sidebar-background": "#0f172a",
    "sidebar-foreground": "#f1f5f9",
    "sidebar-primary": "#082f49",
    "sidebar-primary-foreground": "#bae6fd",
    "sidebar-accent": "#475569",
    "sidebar-accent-foreground": "#cbd5e1",
    "sidebar-border": "#475569",

    // Status
    success: "#10b981",
    "success-foreground": "#ffffff",
    warning: "#f59e0b",
    "warning-foreground": "#ffffff",
    destructive: "#ef4444",
    "destructive-foreground": "#ffffff",

    // Utility colors
    muted: "#374151",
    "muted-foreground": "#9ca3af",
    accent: "#082f49",
    "accent-foreground": "#bae6fd",
    border: "#475569",
    input: "#374151",
    ring: "#0ea5e9",

    // Chart colors (inchangés)
    "chart-1": "#60a5fa",
    "chart-2": "#34d399",
    "chart-3": "#fbbf24",
    "chart-4": "#f87171",
    "chart-5": "#a78bfa",
    "chart-6": "#22d3ee",

    // Badge colors (inchangés)
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
  },
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
    const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")

    const colorKey =
      cleanColorClass === "primary"
        ? "primary"
        : cleanColorClass === "secondary"
          ? "secondary"
          : cleanColorClass === "accent"
            ? "accent"
            : cleanColorClass === "background"
              ? "background"
              : cleanColorClass === "card"
                ? "card-background"
                : cleanColorClass === "popover"
                  ? "popover-background"
                  : cleanColorClass === "muted"
                    ? "muted"
                    : cleanColorClass === "destructive"
                      ? "destructive"
                      : cleanColorClass === "success"
                        ? "success"
                        : cleanColorClass === "warning"
                          ? "warning"
                          : cleanColorClass

    const currentTheme = isDark ? colorTokens.dark : colorTokens.light
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

    console.warn(`Color not found: ${colorClass}`)
    return isDark ? colorTokens.dark.primary : colorTokens.light.primary
  }

  return {
    twColor,
    colorScheme,
    isDark,
    colorTokens: isDark ? colorTokens.dark : colorTokens.light,
  }
}

// Static version for use outside components
export const getStaticTwColor = (colorClass: string, isDarkMode = false): string => {
  const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")

  const colorKey =
    cleanColorClass === "primary"
      ? "primary"
      : cleanColorClass === "secondary"
        ? "secondary"
        : cleanColorClass === "accent"
          ? "accent"
          : cleanColorClass === "background"
            ? "background"
            : cleanColorClass === "card"
              ? "card-background"
              : cleanColorClass === "popover"
                ? "popover-background"
                : cleanColorClass === "muted"
                  ? "muted"
                  : cleanColorClass === "destructive"
                    ? "destructive"
                    : cleanColorClass === "success"
                      ? "success"
                      : cleanColorClass === "warning"
                        ? "warning"
                        : cleanColorClass

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
