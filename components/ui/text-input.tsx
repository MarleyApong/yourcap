import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { forwardRef } from "react"
import { TextInput as RNTextInput, Text, TextInputProps, View } from "react-native"

interface Props extends TextInputProps {
  label?: string
  icon?: string
  error?: string
  required?: boolean
  containerClassName?: string
}

export const TextInput = forwardRef<RNTextInput, Props>(
  ({ label, icon, error, required = false, containerClassName = "mb-6", ...props }, ref) => {
    const { twColor } = useTwColors()

    return (
      <View className={containerClassName}>
        {label && (
          <Text style={{ color: twColor("text-foreground") }} className="font-bold text-lg">
            {label}
            {required ? <Text className="text-red-600"> *</Text> : ""}
          </Text>
        )}
        <View className="border-b border-primary flex-row gap-2 items-center px-3 py-">
          {icon && <Feather name={icon as any} size={20} color={twColor("text-primary")} />}
          <RNTextInput
            ref={ref}
            className={`flex-1 text-lg ${props.className}`}
            // style={{ color: twColor("text-foreground") }}
            placeholderTextColor="#374151"
            {...props}
          />
        </View>
        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
    )
  }
)

TextInput.displayName = "TextInput"