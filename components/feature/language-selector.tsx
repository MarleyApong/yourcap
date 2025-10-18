import { SupportedLanguage, supportedLanguages } from '@/i18n/locales'
import { useTwColors } from '@/lib/tw-colors'
import { Feather } from '@expo/vector-icons'
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

  return (
    <View className="space-y-2">
      {Object.entries(supportedLanguages).map(([key, config]) => {
        const isSelected = key === currentLanguage
        const language = key as SupportedLanguage
        
        return (
          <Pressable
            key={key}
            onPress={() => onLanguageChange(language)}
            className="flex-row items-center justify-between py-3 px-4 rounded-xl"
            style={{
              backgroundColor: isSelected ? twColor("primary") : "transparent",
              borderWidth: 1,
              borderColor: isSelected ? twColor("primary") : twColor("border")
            }}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">{config.flag}</Text>
              <Text 
                style={{ 
                  color: isSelected ? twColor("primary-foreground") : twColor("foreground") 
                }}
                className="text-base font-medium"
              >
                {config.name}
              </Text>
            </View>
            
            {isSelected && (
              <Feather 
                name="check" 
                size={20} 
                color={twColor("primary-foreground")} 
              />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}