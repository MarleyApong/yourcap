export type ColorScheme = "light" | "dark"

type AccentValues = { primary: string; primaryFg: string; secondary: string; secondaryFg: string; ring: string }

export const ACCENT_PRESETS = {
  navy: {
    light: { primary: "#1E3A5F", primaryFg: "#ffffff", secondary: "#EFF6FF", secondaryFg: "#1E3A5F", ring: "#1E3A5F" },
    dark:  { primary: "#4A90D9", primaryFg: "#ffffff", secondary: "#142A47", secondaryFg: "#BFDBFE", ring: "#4A90D9" },
  },
  purple: {
    light: { primary: "#562d8f", primaryFg: "#ffffff", secondary: "#faf5ff", secondaryFg: "#7c3aed", ring: "#562d8f" },
    dark:  { primary: "#a855f7", primaryFg: "#ffffff", secondary: "#312e81", secondaryFg: "#e9d5ff", ring: "#a855f7" },
  },
  blue: {
    light: { primary: "#2563eb", primaryFg: "#ffffff", secondary: "#eff6ff", secondaryFg: "#1d4ed8", ring: "#2563eb" },
    dark:  { primary: "#60a5fa", primaryFg: "#0f172a", secondary: "#1e3a5f", secondaryFg: "#bfdbfe", ring: "#60a5fa" },
  },
  green: {
    light: { primary: "#16a34a", primaryFg: "#ffffff", secondary: "#f0fdf4", secondaryFg: "#15803d", ring: "#16a34a" },
    dark:  { primary: "#34d399", primaryFg: "#0f172a", secondary: "#064e3b", secondaryFg: "#a7f3d0", ring: "#34d399" },
  },
  orange: {
    light: { primary: "#c2410c", primaryFg: "#ffffff", secondary: "#fff7ed", secondaryFg: "#c2410c", ring: "#c2410c" },
    dark:  { primary: "#fb923c", primaryFg: "#0f172a", secondary: "#431407", secondaryFg: "#fed7aa", ring: "#fb923c" },
  },
  rose: {
    light: { primary: "#be123c", primaryFg: "#ffffff", secondary: "#fff1f2", secondaryFg: "#be123c", ring: "#be123c" },
    dark:  { primary: "#fb7185", primaryFg: "#0f172a", secondary: "#4c0519", secondaryFg: "#fecdd3", ring: "#fb7185" },
  },
  teal: {
    light: { primary: "#0f766e", primaryFg: "#ffffff", secondary: "#f0fdfa", secondaryFg: "#0f766e", ring: "#0f766e" },
    dark:  { primary: "#2dd4bf", primaryFg: "#0f172a", secondary: "#134e4a", secondaryFg: "#99f6e4", ring: "#2dd4bf" },
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
      primary: "#0f172a",
      secondary: "#1e293b",
    },
    foreground: {
      primary: "#f1f5f9",
    },
    card: {
      background: "#1e293b",
      foreground: "#f1f5f9",
    },
    popover: {
      background: "#334155",
      foreground: "#f1f5f9",
    },
    primary: {
      default: "#4A90D9",
      foreground: "#ffffff",
      50: "#0D1F35",
      100: "#142A47",
      200: "#1E3A5F",
      500: "#4A90D9",
      600: "#3B7BC4",
      700: "#2D65A8",
      900: "#1E3A5F",
    },
    secondary: {
      default: "#142A47",
      foreground: "#BFDBFE",
    },
    navigation: {
      background: "#1e293b",
      foreground: "#94a3b8",
      activeBackground: "#4A90D9",
      activeForeground: "#ffffff",
      inactiveBackground: "transparent",
      inactiveForeground: "#94a3b8",
      border: "#475569",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
    header: {
      background: "#0f172a",
      foreground: "#f1f5f9",
      primary: "#0D1F35",
      primaryForeground: "#BFDBFE",
      accent: "#475569",
      accentForeground: "#93C5FD",
      border: "#475569",
    },
    sidebar: {
      background: "#0f172a",
      foreground: "#f1f5f9",
      primary: "#0D1F35",
      primaryForeground: "#BFDBFE",
      accent: "#475569",
      accentForeground: "#93C5FD",
      border: "#475569",
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
      default: "#374151",
      foreground: "#9ca3af",
    },
    accent: {
      default: "#142A47",
      foreground: "#BFDBFE",
    },
    border: "#475569",
    input: "#374151",
    ring: "#4A90D9",
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
