import { useTheme } from "@/core/theme"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"

interface LoadingStateProps {
  message?: string
  size?: "small" | "large"
  showCard?: boolean
}

export const LoadingState = ({ message = "Loading...", size = "large", showCard = true }: LoadingStateProps) => {
  const { colors } = useTheme()

  const content = (
    <>
      <ActivityIndicator size={size} color={colors.primary.default} />
      <Text style={[styles.message, { color: colors.muted.foreground }]}>{message}</Text>
    </>
  )

  if (!showCard) {
    return <View style={styles.bare}>{content}</View>
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card.background,
          borderColor: colors.border,
        },
      ]}
    >
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  bare: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  card: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  message: {
    marginTop: 16,
    textAlign: "center",
  },
})
