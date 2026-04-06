import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { AccentKey } from "@/core/theme/colors"

export type ThemeMode = "system" | "light" | "dark"

interface AppState {
  themeMode: ThemeMode
  accentColor: AccentKey
  setThemeMode: (mode: ThemeMode) => void
  setAccentColor: (accent: AccentKey) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: "system",
      accentColor: "purple",
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (accent) => set({ accentColor: accent }),
    }),
    {
      name: "yourcap-app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
