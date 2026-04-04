import { useTheme } from "@/core/theme"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

export const InitialLoadingScreen: React.FC = () => {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.card, { backgroundColor: colors.primary.default }]}>
        <Text style={[styles.text, { color: colors.primary.foreground }]}>Chargement...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
})
