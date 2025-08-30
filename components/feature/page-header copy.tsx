// components/ui/PageHeader.tsx
import { View, Text } from "react-native"
import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"

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

  return (
    <View className={`relative ${textPosition === "center" ? "flex-row items-center" : "flex-col"} mt-14 px-6 ${className}`}>
      {fbackButton && <FBackButton className={`${textPosition === "bottom" ? "mb-4" : "mr-4"}`} path={backPath} isAbsolute={false} />}
      <Text
        className={`text-3xl font-bold ${textAlign === "center" ? "text-center" : textAlign === "left" ? "text-left" : "text-right"} mr-10`}
        style={{ color: twColor("primary") }}
      >
        {title}
      </Text>
    </View>
  )
}
