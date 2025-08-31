import { View, Text, TouchableOpacity } from "react-native"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Href, useRouter } from "expo-router"
// import { useSafeAreaInsets } from "react-native-safe-area-context"

type PageHeaderProps = {
  title: string
  backPath?: Href
  fbackButton?: boolean
  textAlign?: "center" | "left" | "right"
  textPosition?: "bottom" | "center"
  textColor?: string
  className?: string
}

export const PageHeader = ({ title, backPath, fbackButton = true, textAlign = "center", textPosition = "bottom", className = "" }: PageHeaderProps) => {
  const router = useRouter()
  const { twColor } = useTwColors()

  const handlePress = () => {
    if (backPath) {
      router.push(backPath)
    } else {
      router.back()
    }
  }
  // const insets = useSafeAreaInsets()

  return (
    <View
      className={`h-15 ${className}`}
      style={{
        backgroundColor: twColor("background"),
        borderBottomWidth: 1,
        borderColor: twColor("navigation-border"),
        shadowColor: twColor("navigation-shadow"),
        // paddingTop: insets.top - 20,
        paddingBottom: 10,
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 3, // Pour Android
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <View className={`${textPosition === "center" ? "flex-row items-center" : "flex-col"} px-3 pb-0`} style={{ position: "relative" }}>
        {fbackButton ? (
          <TouchableOpacity
            className={`flex-row items-center justify-center w-14 p-2 bg-background/20 border border-primary z-10 rounded-full ${className}`}
            onPress={handlePress}
          >
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
          </TouchableOpacity>
        ) : null}
        <Text
          className={`text-2xl font-bold flex-1 mt-2 ${textAlign === "center" ? "text-center" : textAlign === "left" ? "text-left ml-4" : "text-right mr-4"}`}
          style={{ color: twColor("navigation-foreground") }}
        >
          {title}
        </Text>
        {!fbackButton ? null : <View style={{ width: 24 }} />} {/* Espaceur pour équilibrer */}
      </View>
    </View>
  )
}
