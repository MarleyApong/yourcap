import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet, Text, View } from "react-native"

interface QuickActionButtonProps {
  icon: string
  label: string
  onPress: () => void
}

export const QuickActionButton = ({ icon, label, onPress }: QuickActionButtonProps) => {
  const { colors } = useTheme()

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primary.default + "15" }]}>
        <Feather name={icon as any} size={24} color={colors.primary.default} />
      </View>
      <Text style={[styles.label, { color: colors.muted.foreground }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 999,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
  },
})
