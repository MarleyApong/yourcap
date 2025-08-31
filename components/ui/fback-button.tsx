import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Href } from "expo-router"
import { useRouter } from "expo-router"
import { TouchableOpacity } from "react-native"

type FBackButtonProps = {
  path?: Href
  isAbsolute?: boolean
  className?: string
  color?: string
}

export const FBackButton = ({ path, isAbsolute = true, className, color = "white" }: FBackButtonProps) => {
  const router = useRouter()
  const { twColor } = useTwColors()

  const handlePress = () => {
    if (path) {
      router.replace(path)
    } else {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/")
      }
    }
  }

  return (
    <TouchableOpacity
      style={{
        borderColor: twColor(color),
      }}
      className={`flex-row items-center justify-center bg-primary w-14 p-2 ${isAbsolute ? "absolute top-28 left-6" : ""} bg-background/20 border z-10 rounded-full ${className}`}
      onPress={handlePress}
    >
      <Feather name="chevron-left" size={24} color={twColor(color)} />
    </TouchableOpacity>
  )
}
