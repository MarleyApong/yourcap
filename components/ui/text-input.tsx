import { View, Text, TextInput as RNTextInput, TextInputProps } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"

interface Props extends TextInputProps {
  label?: string
  icon?: string
  error?: string
  containerClassName?: string
}

export const TextInput = ({ label, icon, error, containerClassName = "mb-6", ...props }: Props) => {
  const { twColor } = useTwColors()

  return (
    <View className={containerClassName}>
      {label && <Text className="text-primary font-bold text-lg">{label}</Text>}
      <View className="border-b border-primary flex-row gap-2 items-center px-3 py-">
        {icon && <Feather name={icon as any} size={20} color={twColor("text-primary")} />}
        <RNTextInput className={`flex-1 text-lg ${props.className}`} placeholderTextColor={twColor("text-gray-400")} {...props} />
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  )
}
