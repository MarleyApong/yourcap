import { View, Text } from "react-native"
import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type PageHeaderProps = {
  title: string
  backPath?: string
  fbackButton?: boolean
  textAlign?: "center" | "left" | "right"
  textPosition?: "bottom" | "center"
  textColor?: string
  className?: string
}

export const PageHeader = ({ title, backPath, fbackButton = true, textAlign = "center", textPosition = "bottom", className = "" }: PageHeaderProps) => {
  const { twColor } = useTwColors()
  const insets = useSafeAreaInsets()

  return (
    <View
      className={`bg-white border-b border-gray-200 h-20 m-h-20 ${className}`}
      style={{
        paddingTop: insets.top - 20,
        paddingBottom: 10,
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 3, // Pour Android
        shadowColor: "#000", // Pour iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <View className={`${textPosition === "center" ? "flex-row items-center" : "flex-col"} px-6 pb-0`} style={{ position: "relative" }}>
        {fbackButton ? <FBackButton path={backPath} isAbsolute={false} /> : <View style={{ width: 24 }} />}
        <Text
          className={`text-3xl font-bold flex-1 mt-2 ${textAlign === "center" ? "text-center" : textAlign === "left" ? "text-left ml-4" : "text-right mr-4"}`}
          style={{ color: twColor("primary") }}
        >
          {title}
        </Text>
        {!fbackButton ? null : <View style={{ width: 24 }} />} {/* Espaceur pour équilibrer */}
      </View>
    </View>
  )
}
