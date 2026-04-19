import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet } from "react-native"

interface FabProps {
  onPress: () => void
  icon?: string
  bottom?: number
}

export const Fab = ({ onPress, icon = "plus", bottom = 96 }: FabProps) => {
  const { colors, shadows } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, { backgroundColor: colors.primary.default, bottom }, shadows.lg]}
    >
      <Feather name={icon as any} size={26} color={colors.primary.foreground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
})
