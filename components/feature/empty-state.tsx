import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"

interface EmptyStateProps {
  title: string
  description: string
  buttonText?: string
  onButtonPress?: () => void
  image?: any
  icon?: string
  showCard?: boolean
}

export const EmptyState = ({
  title,
  description,
  buttonText,
  onButtonPress,
  image,
  icon = "inbox",
  showCard = true,
}: EmptyStateProps) => {
  const { colors } = useTheme()

  const content = (
    <>
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <View style={[styles.iconWrapper, { backgroundColor: colors.muted.default + "50" }]}>
          <Feather name={icon as any} size={48} color={colors.muted.foreground} />
        </View>
      )}

      <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted.foreground }]}>{description}</Text>

      {buttonText && onButtonPress && (
        <Pressable
          onPress={onButtonPress}
          style={[styles.button, { backgroundColor: colors.primary.default }]}
        >
          <Text style={[styles.buttonText, { color: colors.primary.foreground }]}>{buttonText}</Text>
        </Pressable>
      )}
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
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  image: {
    width: 128,
    height: 128,
    opacity: 0.5,
  },
  iconWrapper: {
    padding: 24,
    borderRadius: 999,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    fontWeight: "600",
  },
})
