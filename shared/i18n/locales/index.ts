import { fr } from './fr';
import { en } from './en';
import { es } from './es';

// Configuration des langues supportées
export const supportedLanguages = {
  fr: { name: 'Français', flag: '🇫🇷', translations: fr },
  en: { name: 'English', flag: '🇺🇸', translations: en },
  es: { name: 'Español', flag: '🇪🇸', translations: es },
} as const;

// Types dérivés
export type SupportedLanguage = keyof typeof supportedLanguages;
export type TranslationStructure = typeof fr;

// Export des traductions pour faciliter l'accès
export const translations = {
  fr,
  en,
  es,
};

// Langue par défaut
export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';