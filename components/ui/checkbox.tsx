import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/core/theme"

export const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (newValue: boolean) => void }) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.primary.default + "1a",
            borderColor: colors.primary.default,
            borderWidth: checked ? 2 : 1,
          },
        ]}
      >
        {checked && <Feather name="check" size={14} color={colors.primary.default} />}
      </View>
      <Text style={[styles.label, { color: colors.foreground.primary }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
  },
})
