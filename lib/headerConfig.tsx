// lib/headerConfig.tsx - Custom header configurations with React components
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Pressable } from "react-native"

// Custom back button component
export const CustomBackButton = ({ onPress, color }: { onPress: () => void; color: string }) => (
  <Pressable onPress={onPress} className="p-2">
    <Feather name="arrow-left" size={24} color={color} />
  </Pressable>
)

// Default header options factory
export const useDefaultHeaderOptions = () => {
  const { twColor } = useTwColors()
  const router = useRouter()

  return {
    headerShown: true,
    headerStyle: {
      backgroundColor: twColor("white"),
      elevation: 3, // Android shadow
      shadowColor: "#000", // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    headerTintColor: twColor("primary"),
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: "bold" as const,
      color: twColor("primary"),
    },
    headerTitleAlign: "left" as const,
    headerLeft: (props: any) => {
      if (props.canGoBack) {
        return <CustomBackButton onPress={() => router.back()} color={twColor("primary")} />
      }
      return null
    },
    headerBackVisible: false, // Hide default back button
  }
}

// Specific configurations for different screens
export const headerConfigs = {
  // For screens without back button (like main dashboard)
  noBack: (title: string) => {
    const { twColor } = useTwColors()
    return {
      ...useDefaultHeaderOptions(),
      title,
      headerLeft: () => null,
    }
  },

  // For screens with back button
  withBack: (title: string, customBackAction?: () => void) => {
    const { twColor } = useTwColors()
    const router = useRouter()

    return {
      ...useDefaultHeaderOptions(),
      title,
      headerLeft: () => <CustomBackButton onPress={customBackAction || (() => router.back())} color={twColor("primary")} />,
    }
  },

  // For centered titles
  centered: (title: string) => {
    const options = useDefaultHeaderOptions()
    return {
      ...options,
      title,
      headerTitleAlign: "center" as const,
    }
  },

  // For screens with custom right actions
  withActions: (title: string, rightComponent: () => React.ReactNode) => {
    const options = useDefaultHeaderOptions()
    return {
      ...options,
      title,
      headerRight: rightComponent,
    }
  },
}
