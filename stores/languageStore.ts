import { DEFAULT_LANGUAGE, SupportedLanguage } from "@/i18n/locales"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"

const LANGUAGE_KEY = "app_language"

type LanguageState = {
  /** Single source of truth for the current app language (guest + logged-in) */
  appLanguage: SupportedLanguage
  setAppLanguage: (lang: SupportedLanguage) => Promise<void>
  loadAppLanguage: () => Promise<void>
  // Legacy alias kept for welcome screen compatibility
  guestLanguage: SupportedLanguage
  setGuestLanguage: (lang: SupportedLanguage) => Promise<void>
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  appLanguage: DEFAULT_LANGUAGE,
  guestLanguage: DEFAULT_LANGUAGE,

  setAppLanguage: async (lang) => {
    set({ appLanguage: lang, guestLanguage: lang })
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang)
  },

  setGuestLanguage: async (lang) => {
    set({ appLanguage: lang, guestLanguage: lang })
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang)
  },

  loadAppLanguage: async () => {
    try {
      const stored = await SecureStore.getItemAsync(LANGUAGE_KEY)
      if (stored) {
        set({ appLanguage: stored as SupportedLanguage, guestLanguage: stored as SupportedLanguage })
      }
    } catch {}
  },

  // Legacy alias
  loadGuestLanguage: async () => {
    await get().loadAppLanguage()
  },
}))
