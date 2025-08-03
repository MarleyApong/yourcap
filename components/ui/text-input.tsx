import { View, Text, TextInput as RNTextInput, TextInputProps } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"

interface Props extends TextInputProps {
  label?: string
  icon?: string
  error?: string
  containerClassName?: string
}

export const TextInput = ({ label, icon, error, containerClassName = "", ...props }: Props) => {
  const { twColor } = useTwColors()

  return (
    <View className={containerClassName}>
      {label && <Text className="text-gray-500 text-sm mb-1">{label}</Text>}
      <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-2">
        {icon && <Feather name={icon as any} size={20} color={twColor("text-primary")} />}
        <RNTextInput className={`flex-1 text-lg ${props.className}`} placeholderTextColor={twColor("text-gray-400")} {...props} />
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  )
}
