import { SupportedLanguage, supportedLanguages } from '@/i18n/locales'
import { useTwColors } from '@/lib/tw-colors'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  const { twColor } = useTwColors()

  const handleLanguageChange = (language: SupportedLanguage) => {
    console.log('🌐 LanguageSelector: Changing language from', currentLanguage, 'to', language);
    onLanguageChange(language);
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {Object.entries(supportedLanguages).map(([key, config]) => {
        const isSelected = key === currentLanguage
        const language = key as SupportedLanguage
        
        return (
          <Pressable
            key={key}
            onPress={() => handleLanguageChange(language)}
            style={{
              backgroundColor: isSelected ? twColor("primary") : twColor("secondary"),
            }}
            className="px-4 py-2 rounded-full flex-row items-center gap-2"
          >
            <Text className="text-lg">{config.flag}</Text>
            <Text
              style={{
                color: isSelected ? twColor("primary-foreground") : twColor("secondary-foreground"),
              }}
              className="text-sm font-medium"
            >
              {config.name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}