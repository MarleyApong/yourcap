import { DEFAULT_LANGUAGE, SupportedLanguage } from "@/i18n/locales"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"

const LANGUAGE_KEY = "guest_language"

type LanguageState = {
  guestLanguage: SupportedLanguage
  setGuestLanguage: (lang: SupportedLanguage) => Promise<void>
  loadGuestLanguage: () => Promise<void>
}

export const useLanguageStore = create<LanguageState>((set) => ({
  guestLanguage: DEFAULT_LANGUAGE,

  setGuestLanguage: async (lang) => {
    set({ guestLanguage: lang })
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang)
  },

  loadGuestLanguage: async () => {
    try {
      const stored = await SecureStore.getItemAsync(LANGUAGE_KEY)
      if (stored) {
        set({ guestLanguage: stored as SupportedLanguage })
      }
    } catch {}
  },
}))
