import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Href, useRouter } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

type PageHeaderProps = {
  title: string
  backPath?: Href
  fbackButton?: boolean
  textAlign?: "center" | "left" | "right"
  textPosition?: "bottom" | "center"
}

export const PageHeader = ({
  title,
  backPath,
  fbackButton = true,
  textAlign = "center",
  textPosition = "bottom",
}: PageHeaderProps) => {
  const router = useRouter()
  const { colors } = useTheme()

  const handlePress = () => {
    if (backPath) {
      router.push(backPath)
    } else {
      router.back()
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderBottomColor: colors.navigation.border,
          shadowColor: colors.navigation.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          textPosition === "center" ? styles.row : styles.col,
        ]}
      >
        {fbackButton && (
          <TouchableOpacity style={styles.backBtn} onPress={handlePress}>
            <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.title,
            { color: colors.foreground.primary },
            textAlign === "center" && styles.textCenter,
            textAlign === "left" && styles.textLeft,
            textAlign === "right" && styles.textRight,
          ]}
        >
          {title}
        </Text>
        {fbackButton && <View style={styles.spacer} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
    paddingTop: 20,
    paddingBottom: 10,
  },
  inner: {
    paddingHorizontal: 12,
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  col: {
    flexDirection: "column",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginTop: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    marginTop: 8,
  },
  textCenter: { textAlign: "center" },
  textLeft: { textAlign: "left", marginLeft: 16 },
  textRight: { textAlign: "right", marginRight: 16 },
  spacer: { width: 24 },
})
