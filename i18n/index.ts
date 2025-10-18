import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_LANGUAGE, translations as localeTranslations, SupportedLanguage } from './locales';
import type { TranslationKey, TranslationKeys } from './types';

export const translations = localeTranslations;

// Hook avec type-safety et support de la langue utilisateur
export const useTranslation = () => {
  const { user } = useAuthStore();
  
  // Utiliser la langue de l'utilisateur ou la langue par défaut
  const currentLanguage: SupportedLanguage = (user?.settings?.language as SupportedLanguage) || DEFAULT_LANGUAGE;
  
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // En développement, afficher une erreur claire
        if (__DEV__) {
          console.error(`❌ Translation key not found: "${key}" for language "${currentLanguage}"`);
          console.error(`Available keys starting with "${keys[0]}": ${Object.keys(translations[currentLanguage]).filter(k => k.startsWith(keys[0]))}`);
        }
        
        // Fallback sur la langue par défaut si la clé n'existe pas
        if (currentLanguage !== DEFAULT_LANGUAGE) {
          let fallbackValue: any = translations[DEFAULT_LANGUAGE];
          for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
              fallbackValue = fallbackValue[k];
            } else {
              return key; // Return the key if translation doesn't exist even in fallback
            }
          }
          return typeof fallbackValue === 'string' ? fallbackValue : key;
        }
        
        return key; // Return the key if translation doesn't exist
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, currentLanguage };
};

// Fonction utilitaire pour vérifier si une clé existe
export const hasTranslation = (key: string): key is TranslationKey => {
  const keys = key.split('.');
  let value: any = translations[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }
  
  return typeof value === 'string';
};

// Export des types
export type { TranslationKey, TranslationKeys };

