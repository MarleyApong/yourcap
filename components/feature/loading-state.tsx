import { useTwColors } from "@/lib/tw-colors"
import { ActivityIndicator, Text, View } from "react-native"

interface LoadingStateProps {
  message?: string
  size?: "small" | "large"
  showCard?: boolean
}

export const LoadingState = ({ message = "Loading...", size = "large", showCard = true }: LoadingStateProps) => {
  const { twColor } = useTwColors()

  const content = (
    <>
      <ActivityIndicator size={size} color={twColor("primary")} />
      <Text style={{ color: twColor("muted-foreground") }} className="mt-4 text-center">
        {message}
      </Text>
    </>
  )

  if (!showCard) {
    return <View className="flex-1 items-center justify-center py-8">{content}</View>
  }

  return (
    <View
      style={{
        backgroundColor: twColor("card-background"),
        borderColor: twColor("border"),
      }}
      className="rounded-xl p-8 shadow-sm items-center justify-center border"
    >
      {content}
    </View>
  )
}
