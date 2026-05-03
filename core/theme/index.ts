import { useColorScheme } from "react-native"
import { useAppStore } from "@/core/stores/appStore"
import { ACCENT_PRESETS, colors, ColorScheme } from "./colors"
import { borderRadius, opacity, shadows, sizes, spacing, typography } from "./tokens"
import { textStyles } from "./typography"

export const useTheme = () => {
  const systemColorScheme = useColorScheme()
  const themeMode = useAppStore((s) => s.themeMode)
  const accentColor = useAppStore((s) => s.accentColor)
  const resolved = themeMode === "system" ? (systemColorScheme ?? "light") : themeMode
  const theme = resolved as ColorScheme

  const base = colors[theme]
  const accent = ACCENT_PRESETS[accentColor ?? "navy"][theme]

  const themedColors = {
    ...base,
    primary: {
      ...base.primary,
      default: accent.primary,
      foreground: accent.primaryFg,
    },
    secondary: {
      default: accent.secondary,
      foreground: accent.secondaryFg,
    },
    accent: {
      default: accent.secondary,
      foreground: accent.secondaryFg,
    },
    ring: accent.ring,
    navigation: {
      ...base.navigation,
      activeBackground: accent.primary,
      activeForeground: accent.primaryFg,
      shadow: `${accent.primary}18`,
    },
    header: {
      ...base.header,
      primary: accent.secondary,
      primaryForeground: accent.primary,
      accentForeground: accent.secondaryFg,
    },
    sidebar: {
      ...base.sidebar,
      primary: accent.secondary,
      primaryForeground: accent.primary,
      accentForeground: accent.secondaryFg,
    },
  }

  return {
    isDark: theme === "dark",
    colors: themedColors,
    theme,
    accentColor: accentColor ?? "navy",
    spacing,
    typography,
    borderRadius,
    shadows,
    opacity,
    sizes,
    textStyles,
  }
}

export type Theme = ReturnType<typeof useTheme>
export { ColorScheme, type ThemeColors } from "./colors"
export * from "./tokens"
export * from "./typography"
