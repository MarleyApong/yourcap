import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Href, useRouter } from "expo-router"
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native"

type FBackButtonProps = {
  path?: Href
  isAbsolute?: boolean
  style?: ViewStyle
  color?: string
  onPress?: () => void
}

export const FBackButton = ({ path, isAbsolute = true, style, color, onPress }: FBackButtonProps) => {
  const router = useRouter()
  const { colors } = useTheme()
  const resolvedColor = color ?? colors.foreground.primary

  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }
    if (path) {
      router.replace(path)
    } else {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/")
      }
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isAbsolute && styles.absolute,
        { borderColor: resolvedColor, backgroundColor: colors.background.primary + "33" },
        style,
      ]}
      onPress={handlePress}
    >
      <Feather name="chevron-left" size={24} color={resolvedColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    padding: 8,
    borderWidth: 1,
    borderRadius: 999,
    zIndex: 10,
  },
  absolute: {
    position: "absolute",
    top: 112,
    left: 24,
  },
})
