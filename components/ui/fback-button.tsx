import { Feather } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { useTwColors } from "@/lib/tw-colors"

type FBackButtonProps = {
  path?: string
}

export const FBackButton = ({ path }: FBackButtonProps) => {
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
    <TouchableOpacity className="flex-row items-center justify-center p-2 absolute top-28 left-6 bg-background/20 border border-primary z-10 rounded-full" onPress={handlePress}>
      <Feather name="chevron-left" size={24} color={twColor("primary")} />
    </TouchableOpacity>
  )
}
