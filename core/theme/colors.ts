export type ColorScheme = "light" | "dark"

type AccentValues = { primary: string; primaryFg: string; secondary: string; secondaryFg: string; ring: string }

export const ACCENT_PRESETS = {
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
      default: "#562d8f",
      foreground: "#ffffff",
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      900: "#562d8f",
    },
    secondary: {
      default: "#faf5ff",
      foreground: "#7c3aed",
    },
    navigation: {
      background: "#ffffff",
      foreground: "#64748b",
      activeBackground: "#562d8f",
      activeForeground: "#ffffff",
      inactiveBackground: "transparent",
      inactiveForeground: "#64748b",
      border: "#e2e8f0",
      shadow: "rgba(86, 45, 143, 0.08)",
    },
    header: {
      background: "#ffffff",
      foreground: "#1e293b",
      primary: "#faf5ff",
      primaryForeground: "#562d8f",
      accent: "#e2e8f0",
      accentForeground: "#7c3aed",
      border: "#e2e8f0",
    },
    sidebar: {
      background: "#ffffff",
      foreground: "#1e293b",
      primary: "#faf5ff",
      primaryForeground: "#562d8f",
      accent: "#e2e8f0",
      accentForeground: "#7c3aed",
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
      default: "#faf5ff",
      foreground: "#7c3aed",
    },
    border: "#e2e8f0",
    input: "#f8fafc",
    ring: "#562d8f",
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
      default: "#a855f7",
      foreground: "#ffffff",
      50: "#1e1b4b",
      100: "#312e81",
      200: "#3730a3",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      900: "#562d8f",
    },
    secondary: {
      default: "#312e81",
      foreground: "#e9d5ff",
    },
    navigation: {
      background: "#1e293b",
      foreground: "#94a3b8",
      activeBackground: "#a855f7",
      activeForeground: "#ffffff",
      inactiveBackground: "transparent",
      inactiveForeground: "#94a3b8",
      border: "#475569",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
    header: {
      background: "#0f172a",
      foreground: "#f1f5f9",
      primary: "#1e1b4b",
      primaryForeground: "#e9d5ff",
      accent: "#475569",
      accentForeground: "#cbd5e1",
      border: "#475569",
    },
    sidebar: {
      background: "#0f172a",
      foreground: "#f1f5f9",
      primary: "#1e1b4b",
      primaryForeground: "#e9d5ff",
      accent: "#475569",
      accentForeground: "#cbd5e1",
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
      default: "#1e1b4b",
      foreground: "#e9d5ff",
    },
    border: "#475569",
    input: "#374151",
    ring: "#a855f7",
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
