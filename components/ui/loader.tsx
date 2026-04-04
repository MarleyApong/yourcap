import { ActivityIndicator } from "react-native"
import { useTheme } from "@/core/theme"

interface LoaderProps {
  size?: "small" | "large"
  color?: string
}

export const Loader = ({ size = "small", color }: LoaderProps) => {
  const { colors } = useTheme()

  return <ActivityIndicator size={size} color={color ?? "#ffffff"} />
}
