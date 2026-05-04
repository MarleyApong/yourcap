export type ColorScheme = "light" | "dark"

type AccentValues = { primary: string; primaryFg: string; secondary: string; secondaryFg: string; ring: string }

export const ACCENT_PRESETS = {
  navy: {
    light: { primary: "#1E3A5F", primaryFg: "#ffffff", secondary: "#EFF6FF", secondaryFg: "#1E3A5F", ring: "#1E3A5F" },
    dark:  { primary: "#1E3A5F", primaryFg: "#ffffff", secondary: "#1A3050", secondaryFg: "#93C5FD", ring: "#1E3A5F" },
  },
  orange: {
    light: { primary: "#c2410c", primaryFg: "#ffffff", secondary: "#fff7ed", secondaryFg: "#c2410c", ring: "#c2410c" },
    dark:  { primary: "#fb923c", primaryFg: "#ffffff", secondary: "#431407", secondaryFg: "#fed7aa", ring: "#fb923c" },
  },
  purple: {
    light: { primary: "#562d8f", primaryFg: "#ffffff", secondary: "#faf5ff", secondaryFg: "#7c3aed", ring: "#562d8f" },
    dark:  { primary: "#a855f7", primaryFg: "#ffffff", secondary: "#312e81", secondaryFg: "#e9d5ff", ring: "#a855f7" },
  },
  rose: {
    light: { primary: "#be123c", primaryFg: "#ffffff", secondary: "#fff1f2", secondaryFg: "#be123c", ring: "#be123c" },
    dark:  { primary: "#fb7185", primaryFg: "#ffffff", secondary: "#4c0519", secondaryFg: "#fecdd3", ring: "#fb7185" },
  },
} as const satisfies Record<string, Record<ColorScheme, AccentValues>>

export type AccentKey = keyof typeof ACCENT_PRESETS

export const colors = {
  light: {
    background: {
      primary: "#fdfdfe",
      secondary: "#f8fafc",
    },
    foreground: {
      primary: "#1e293b",
    },
    card: {
      background: "#ffffff",
      foreground: "#1e293b",
    },
    popover: {
      background: "#ffffff",
      foreground: "#1e293b",
    },
    primary: {
      default: "#1E3A5F",
      foreground: "#ffffff",
      50: "#F0F5FB",
      100: "#D6E4F5",
      200: "#AECAE8",
      500: "#3B7EC8",
      600: "#2A6AB3",
      700: "#1E5296",
      900: "#1E3A5F",
    },
    secondary: {
      default: "#EFF6FF",
      foreground: "#1E3A5F",
    },
    navigation: {
      background: "#ffffff",
      foreground: "#64748b",
      activeBackground: "#1E3A5F",
      activeForeground: "#ffffff",
      inactiveBackground: "transparent",
      inactiveForeground: "#64748b",
      border: "#e2e8f0",
      shadow: "rgba(30, 58, 95, 0.08)",
    },
    header: {
      background: "#ffffff",
      foreground: "#1e293b",
      primary: "#EFF6FF",
      primaryForeground: "#1E3A5F",
      accent: "#e2e8f0",
      accentForeground: "#1E5296",
      border: "#e2e8f0",
    },
    sidebar: {
      background: "#ffffff",
      foreground: "#1e293b",
      primary: "#EFF6FF",
      primaryForeground: "#1E3A5F",
      accent: "#e2e8f0",
      accentForeground: "#1E5296",
      border: "#e2e8f0",
    },
    status: {
      success: "#10b981",
      successForeground: "#ffffff",
      warning: "#f59e0b",
      warningForeground: "#ffffff",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
    muted: {
      default: "#f8fafc",
      foreground: "#64748b",
    },
    accent: {
      default: "#EFF6FF",
      foreground: "#1E3A5F",
    },
    border: "#e2e8f0",
    input: "#f8fafc",
    ring: "#1E3A5F",
    chart: {
      1: "#3b82f6",
      2: "#10b981",
      3: "#f59e0b",
      4: "#ef4444",
      5: "#8b5cf6",
      6: "#06b6d4",
    },
    badge: {
      bg1: "#dcfce7",
      bg2: "#dbeafe",
      bg3: "#fed7aa",
      bg4: "#fce7f3",
      bg5: "#fee2e2",
      fg1: "#166534",
      fg2: "#1e40af",
      fg3: "#9a3412",
      fg4: "#be185d",
      fg5: "#dc2626",
    },
  },

  dark: {
    background: {
      primary: "#0B1622",
      secondary: "#0F1E2D",
    },
    foreground: {
      primary: "#E8F0F8",
    },
    card: {
      background: "#132030",
      foreground: "#E8F0F8",
    },
    popover: {
      background: "#1A3050",
      foreground: "#E8F0F8",
    },
    primary: {
      default: "#1E3A5F",
      foreground: "#ffffff",
      50: "#0B1622",
      100: "#0F1E2D",
      200: "#132030",
      500: "#1E3A5F",
      600: "#1A3356",
      700: "#162C4C",
      900: "#1E3A5F",
    },
    secondary: {
      default: "#1A3050",
      foreground: "#93C5FD",
    },
    navigation: {
      background: "#0F1E2D",
      foreground: "#7A9BB8",
      activeBackground: "#1E3A5F",
      activeForeground: "#ffffff",
      inactiveBackground: "transparent",
      inactiveForeground: "#7A9BB8",
      border: "#243A52",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
    header: {
      background: "#0B1622",
      foreground: "#E8F0F8",
      primary: "#1A3050",
      primaryForeground: "#93C5FD",
      accent: "#243A52",
      accentForeground: "#93C5FD",
      border: "#243A52",
    },
    sidebar: {
      background: "#0B1622",
      foreground: "#E8F0F8",
      primary: "#1A3050",
      primaryForeground: "#93C5FD",
      accent: "#243A52",
      accentForeground: "#93C5FD",
      border: "#243A52",
    },
    status: {
      success: "#10b981",
      successForeground: "#ffffff",
      warning: "#f59e0b",
      warningForeground: "#ffffff",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
    },
    muted: {
      default: "#132030",
      foreground: "#7A9BB8",
    },
    accent: {
      default: "#1A3050",
      foreground: "#93C5FD",
    },
    border: "#243A52",
    input: "#132030",
    ring: "#1E3A5F",
    chart: {
      1: "#60a5fa",
      2: "#34d399",
      3: "#fbbf24",
      4: "#f87171",
      5: "#a78bfa",
      6: "#22d3ee",
    },
    badge: {
      bg1: "#166534",
      bg2: "#1e40af",
      bg3: "#9a3412",
      bg4: "#be185d",
      bg5: "#dc2626",
      fg1: "#dcfce7",
      fg2: "#dbeafe",
      fg3: "#fed7aa",
      fg4: "#fce7f3",
      fg5: "#fee2e2",
    },
  },
} as const

export type ThemeColors = typeof colors.light
