import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ThemeMode = "system" | "light" | "dark"

interface AppState {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: "system",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "yourcap-app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
