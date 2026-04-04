import { useTheme } from "@/core/theme"
import { SupportedLanguage, supportedLanguages } from "@/i18n/locales"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      {Object.entries(supportedLanguages).map(([key, config]) => {
        const isSelected = key === currentLanguage
        const language = key as SupportedLanguage

        return (
          <Pressable
            key={key}
            onPress={() => onLanguageChange(language)}
            style={[
              styles.item,
              { backgroundColor: isSelected ? colors.primary.default : colors.secondary.default },
            ]}
          >
            <Text style={styles.flag}>{config.flag}</Text>
            <Text
              style={[
                styles.name,
                { color: isSelected ? colors.primary.foreground : colors.secondary.foreground },
              ]}
            >
              {config.name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flag: {
    fontSize: 18,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
  },
})
