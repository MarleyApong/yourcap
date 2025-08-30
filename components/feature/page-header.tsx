import { View, Text } from "react-native"
import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"
// import { useSafeAreaInsets } from "react-native-safe-area-context"

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
        {fbackButton ? <FBackButton path={backPath} isAbsolute={false} /> : null }
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
