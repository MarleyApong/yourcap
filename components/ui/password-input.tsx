import { cn } from "@/lib/utils"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { TextInput, TextInputProps, View } from "react-native"

type PasswordInputProps = TextInputProps & {
  containerClassName?: string
  iconColor?: string
}

export const PasswordInput = ({ className, containerClassName, iconColor = "green", ...props }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={cn("flex-1", containerClassName)}>
      <TextInput className={cn("", className)} secureTextEntry={!showPassword} placeholder="Password" autoCapitalize="none" {...props} />

      <Feather
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ position: "absolute", right: 0 }}
        name={showPassword ? "eye-off" : "eye"}
        size={22}
        color={iconColor}
        onPress={() => setShowPassword((prev) => !prev)}
      />
    </View>
  )
}
