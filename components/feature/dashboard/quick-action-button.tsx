import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Pressable, Text, View } from "react-native"

interface QuickActionButtonProps {
  icon: string
  label: string
  onPress: () => void
}

export const QuickActionButton = ({ icon, label, onPress }: QuickActionButtonProps) => {
  const { twColor } = useTwColors()

  return (
    <Pressable onPress={onPress} className="items-center">
      <View
        style={{
          backgroundColor: `${twColor("primary")}15`, // 15 for 15% opacity
        }}
        className="p-3 rounded-full"
      >
        <Feather name={icon as any} size={24} color={twColor("primary")} />
      </View>
      <Text style={{ color: twColor("muted-foreground") }} className="mt-2 text-sm">
        {label}
      </Text>
    </Pressable>
  )
}
