import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import { de } from './de';
import { pt } from './pt';

// Configuration des langues supportées
export const supportedLanguages = {
  fr: { name: 'Français', flag: '🇫🇷', translations: fr },
  en: { name: 'English', flag: '🇺🇸', translations: en },
  es: { name: 'Español', flag: '🇪🇸', translations: es },
  de: { name: 'Deutsch', flag: '🇩🇪', translations: de },
  pt: { name: 'Português', flag: '🇧🇷', translations: pt },
} as const;

// Types dérivés
export type SupportedLanguage = keyof typeof supportedLanguages;
export type TranslationStructure = typeof fr;

// Export des traductions pour faciliter l'accès
export const translations = {
  fr,
  en,
  es,
  de,
  pt,
};

// Langue par défaut
export const DEFAULT_LANGUAGE: SupportedLanguage = 'fr';