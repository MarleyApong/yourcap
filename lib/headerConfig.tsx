import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Pressable, StyleSheet } from "react-native"

export const CustomBackButton = ({ onPress, color }: { onPress: () => void; color: string }) => (
  <Pressable onPress={onPress} style={styles.backBtn}>
    <Feather name="arrow-left" size={24} color={color} />
  </Pressable>
)

export const useDefaultHeaderOptions = () => {
  const { colors } = useTheme()
  const router = useRouter()

  return {
    headerShown: true,
    headerStyle: {
      backgroundColor: "#ffffff",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    headerTintColor: colors.primary.default,
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: "bold" as const,
      color: colors.primary.default,
    },
    headerTitleAlign: "left" as const,
    headerLeft: (props: any) => {
      if (props.canGoBack) {
        return <CustomBackButton onPress={() => router.back()} color={colors.primary.default} />
      }
      return null
    },
    headerBackVisible: false,
  }
}

export const headerConfigs = {
  noBack: (title: string) => {
    return {
      ...useDefaultHeaderOptions(),
      title,
      headerLeft: () => null,
    }
  },

  withBack: (title: string, customBackAction?: () => void) => {
    const { colors } = useTheme()
    const router = useRouter()

    return {
      ...useDefaultHeaderOptions(),
      title,
      headerLeft: () => (
        <CustomBackButton onPress={customBackAction || (() => router.back())} color={colors.primary.default} />
      ),
    }
  },

  centered: (title: string) => {
    const options = useDefaultHeaderOptions()
    return {
      ...options,
      title,
      headerTitleAlign: "center" as const,
    }
  },

  withActions: (title: string, rightComponent: () => React.ReactNode) => {
    const options = useDefaultHeaderOptions()
    return {
      ...options,
      title,
      headerRight: rightComponent,
    }
  },
}

const styles = StyleSheet.create({
  backBtn: { padding: 8 },
})
