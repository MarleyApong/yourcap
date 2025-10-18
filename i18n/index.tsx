import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { DEFAULT_LANGUAGE, supportedLanguages, translations, type SupportedLanguage } from "./locales"
import type { TranslationKey, TranslationKeys } from "./types"

// Clé de stockage pour la langue préférée
const LANGUAGE_STORAGE_KEY = "@elite_ecommerce_language"

interface I18nContextType {
  currentLanguage: SupportedLanguage
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  t: (key: TranslationKey) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    loadSavedLanguage()
  }, [])

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (savedLanguage && savedLanguage in supportedLanguages) {
        setCurrentLanguage(savedLanguage as SupportedLanguage)
      }
    } catch (error) {
      console.warn("Erreur lors du chargement de la langue:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
      setCurrentLanguage(language)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la langue:", error)
    }
  }

  const t = (key: TranslationKey): string => {
    const keys = key.split(".")
    let value: any = translations[currentLanguage]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        if (__DEV__) {
          console.error(`❌ Translation key not found: "${key}" for language "${currentLanguage}"`)
        }
        return key
      }
    }

    return typeof value === "string" ? value : key
  }

  const contextValue: I18nContextType = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

// Hook principal
export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    // Fallback pour compatibilité - utilise la langue par défaut
    return useSimpleTranslation()
  }
  return context
}

// Hook simplifié pour la compatibilité (sans provider)
export const useSimpleTranslation = () => {
  const t = (key: TranslationKey): string => {
    const keys = key.split(".")
    let value: any = translations.fr // Utiliser directement fr au lieu de DEFAULT_LANGUAGE
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        if (__DEV__) {
          console.error(`❌ Translation key not found: "${key}" at part "${k}"`)
        }
        return key
      }
    }

    return typeof value === "string" ? value : key
  }

  return { t }
}

// Fonction utilitaire pour vérifier si une clé existe
export const hasTranslation = (key: string, language: SupportedLanguage = DEFAULT_LANGUAGE): key is TranslationKey => {
  const keys = key.split(".")
  let value: any = translations[language]

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return false
    }
  }

  return typeof value === "string"
}

// Exports pour faciliter l'usage
export { DEFAULT_LANGUAGE, supportedLanguages, translations }
export type { SupportedLanguage, TranslationKey, TranslationKeys }

