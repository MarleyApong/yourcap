import { ActivityIndicator } from "react-native"
import { useTwColors } from "@/lib/tw-colors"

export const Loader = ({ size = "small", color = "text-white" }) => {
  const { twColor } = useTwColors()

  return <ActivityIndicator size={size as "small" | "large"} color={twColor(color)} />
}
