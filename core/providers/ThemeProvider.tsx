import React, { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme as useRNColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { colors, ColorScheme, ThemeColors } from "../theme/colors"

interface ThemeContextType {
  colorScheme: ColorScheme
  isDark: boolean
  colors: ThemeColors
  toggleTheme: () => void
  setTheme: (scheme: ColorScheme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = "@yourcap_theme"

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useRNColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light")
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY)
      if (saved === "light" || saved === "dark") {
        setColorScheme(saved)
      } else {
        setColorScheme(systemColorScheme === "dark" ? "dark" : "light")
      }
    } catch {
      setColorScheme("light")
    } finally {
      setIsReady(true)
    }
  }

  const setTheme = (scheme: ColorScheme) => {
    setColorScheme(scheme)
    AsyncStorage.setItem(THEME_KEY, scheme).catch(() => {})
  }

  const toggleTheme = () => {
    setTheme(colorScheme === "light" ? "dark" : "light")
  }

  if (!isReady) return null

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        isDark: colorScheme === "dark",
        colors: colors[colorScheme],
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider")
  return ctx
}
