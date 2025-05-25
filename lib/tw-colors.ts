// utils/tw-colors.ts
import { useColorScheme } from "react-native"
import colors from "tailwindcss/colors"
import tailwindConfig from "../tailwind.config"

const defaultTailwindColors = colors

// Flatten les couleurs custom en objet simple
const flattenColors = (colors: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(colors)) {
    const newKey = prefix ? `${prefix}-${key}` : key
    
    if (typeof value === 'string') {
      result[newKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenColors(value, newKey))
    }
  }
  
  return result
}

// Récupérer toutes les couleurs custom (light et dark)
const getCustomColors = () => {
  const customColors = tailwindConfig.theme?.extend?.colors || {}
  return flattenColors(customColors)
}

// Récupérer une valeur nested dans un objet
const getNestedColorValue = (obj: any, path: string[]): string | undefined => {
  let current = obj

  for (const key of path) {
    if (current?.[key] === undefined) return undefined
    current = current[key]
  }

  return typeof current === "string" ? current : undefined
}

export const useTwColors = () => {
  const colorScheme = useColorScheme()
  const customColors = getCustomColors()

  const twColor = (colorClass: string): string => {
    // Nettoyer la classe (enlever les préfixes comme text-, bg-, border-, etc.)
    const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")
    
    // Si c'est juste "primary", on ajoute "DEFAULT"
    const colorKey = cleanColorClass === 'primary' ? 'primary-DEFAULT' : 
                     cleanColorClass === 'secondary' ? 'secondary-DEFAULT' :
                     cleanColorClass === 'accent' ? 'accent-DEFAULT' :
                     cleanColorClass === 'background' ? 'background-DEFAULT' :
                     cleanColorClass === 'card' ? 'card-DEFAULT' :
                     cleanColorClass === 'popover' ? 'popover-DEFAULT' :
                     cleanColorClass === 'muted' ? 'muted-DEFAULT' :
                     cleanColorClass === 'destructive' ? 'destructive-DEFAULT' :
                     cleanColorClass

    // 1. Chercher dans les couleurs dark si on est en mode sombre
    if (colorScheme === 'dark') {
      const darkColorKey = `dark-${colorKey}`
      if (customColors[darkColorKey]) {
        return customColors[darkColorKey]
      }
    }

    // 2. Chercher dans les couleurs normales (custom)
    if (customColors[colorKey]) {
      return customColors[colorKey]
    }

    // 3. Chercher dans les couleurs par défaut de Tailwind
    const colorPath = cleanColorClass.split('-')
    const defaultColor = getNestedColorValue(defaultTailwindColors, colorPath)
    if (defaultColor) {
      return defaultColor
    }

    // 4. Gestion spéciale pour les couleurs communes
    const commonColors: Record<string, string> = {
      'white': '#ffffff',
      'black': '#000000',
      'transparent': 'transparent',
      'current': 'currentColor',
      'green': '#22c55e',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'indigo': '#6366f1',
      'gray': '#6b7280',
      'slate': '#64748b',
      'zinc': '#71717a',
      'neutral': '#737373',
      'stone': '#78716c',
    }

    if (commonColors[cleanColorClass]) {
      return commonColors[cleanColorClass]
    }

    // Fallback
    console.warn(`Couleur non trouvée: ${colorClass}`)
    return colorScheme === 'dark' ? '#2ea04c' : '#0e4b76' // primary par défaut
  }

  return { twColor, customColors }
}

// Version pour usage hors composants
export const getStaticTwColor = (colorClass: string, isDarkMode = false): string => {
  const customColors = getCustomColors()
  
  const cleanColorClass = colorClass.replace(/^(text|bg|border|ring|shadow|decoration|divide|outline|placeholder)-/, "")
  
  const colorKey = cleanColorClass === 'primary' ? 'primary-DEFAULT' : 
                   cleanColorClass === 'secondary' ? 'secondary-DEFAULT' :
                   cleanColorClass === 'accent' ? 'accent-DEFAULT' :
                   cleanColorClass === 'background' ? 'background-DEFAULT' :
                   cleanColorClass === 'card' ? 'card-DEFAULT' :
                   cleanColorClass === 'popover' ? 'popover-DEFAULT' :
                   cleanColorClass === 'muted' ? 'muted-DEFAULT' :
                   cleanColorClass === 'destructive' ? 'destructive-DEFAULT' :
                   cleanColorClass

  if (isDarkMode) {
    const darkColorKey = `dark-${colorKey}`
    if (customColors[darkColorKey]) {
      return customColors[darkColorKey]
    }
  }

  if (customColors[colorKey]) {
    return customColors[colorKey]
  }

  const colorPath = cleanColorClass.split('-')
  const defaultColor = getNestedColorValue(defaultTailwindColors, colorPath)
  if (defaultColor) {
    return defaultColor
  }

  const commonColors: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'transparent': 'transparent',
    'current': 'currentColor',
    'green': '#22c55e',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'yellow': '#eab308',
    'purple': '#a855f7',
    'pink': '#ec4899',
    'indigo': '#6366f1',
    'gray': '#6b7280',
    'slate': '#64748b',
    'zinc': '#71717a',
    'neutral': '#737373',
    'stone': '#78716c',
  }

  if (commonColors[cleanColorClass]) {
    return commonColors[cleanColorClass]
  }

  return isDarkMode ? '#2ea04c' : '#0e4b76'
}

// Helper pour debug - à supprimer en production
export const debugColors = () => {
  const customColors = getCustomColors()
  console.log('Available colors:', Object.keys(customColors))
  return customColors
}