import { useColorScheme } from "react-native"
import { useAppStore } from "@/core/stores/appStore"
import { colors, ColorScheme } from "./colors"
import { borderRadius, opacity, shadows, sizes, spacing, typography } from "./tokens"
import { textStyles } from "./typography"

export const useTheme = () => {
  const systemColorScheme = useColorScheme()
  const themeMode = useAppStore((s) => s.themeMode)
  const resolved = themeMode === "system" ? (systemColorScheme ?? "light") : themeMode
  const theme = resolved as ColorScheme

  return {
    isDark: theme === "dark",
    colors: colors[theme],
    theme,
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
