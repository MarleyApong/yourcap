import { useAuthStore } from '@/stores/authStore';
import React from 'react';
import { DEFAULT_LANGUAGE, translations as localeTranslations, SupportedLanguage } from './locales';
import type { TranslationKey, TranslationKeys } from './types';

export const translations = localeTranslations;

// Hook avec type-safety et support de la langue utilisateur
export const useTranslation = () => {
  const { user } = useAuthStore();
  
  // Utiliser la langue de l'utilisateur ou la langue par défaut
  const currentLanguage: SupportedLanguage = (user?.settings?.language as SupportedLanguage) || DEFAULT_LANGUAGE;
  
  // Debug: Log language changes
  React.useEffect(() => {
    console.log('🌐 Current language:', currentLanguage, 'from user settings:', user?.settings?.language);
  }, [currentLanguage, user?.settings?.language]);
  
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

// Fonction utilitaire pour obtenir les traductions sans React Hook (pour les services)
export const getTranslationFunction = (language: SupportedLanguage = DEFAULT_LANGUAGE) => {
  return (key: TranslationKey, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback sur la langue par défaut si la clé n'existe pas
        if (language !== DEFAULT_LANGUAGE) {
          let fallbackValue: any = translations[DEFAULT_LANGUAGE];
          for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
              fallbackValue = fallbackValue[k];
            } else {
              return key; // Return the key if translation doesn't exist even in fallback
            }
          }
          value = fallbackValue;
        } else {
          return key; // Return the key if translation doesn't exist
        }
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Simple parameter replacement
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([key, val]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
      });
    }
    
    return result;
  };
};

// Export des types
export type { TranslationKey, TranslationKeys };

