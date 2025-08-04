import { Feather } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { useTwColors } from "@/lib/tw-colors"

type FBackButtonProps = {
  path?: string
  isAbsolute?: boolean
  className?: string
}

export const FBackButton = ({ path, isAbsolute = true, className }: FBackButtonProps) => {
  const router = useRouter()
  const { twColor } = useTwColors()

  const handlePress = () => {
    if (path) {
      router.push(path as any)
    } else {
      router.back()
    }
  }

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center w-12 p-2 ${isAbsolute ? "absolute top-28 left-6" : ""} bg-background/20 border border-primary z-10 rounded-full ${className}`}
      onPress={handlePress}
    >
      <Feather name="chevron-left" size={24} color={twColor("primary")} />
    </TouchableOpacity>
  )
}
