import { cn } from "@/lib/utils"
import { Feather } from "@expo/vector-icons"
import { forwardRef, useState } from "react"
import { TextInput, TextInputProps, View } from "react-native"

type PasswordInputProps = TextInputProps & {
  containerClassName?: string
  iconColor?: string
}

// Export direct sans wrapper
export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ className, containerClassName, iconColor = "green", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <View className={cn("flex-1 flex-row items-center", containerClassName)}>
        <TextInput
          ref={ref}
          className={cn("flex-1", className)}
          secureTextEntry={!showPassword}
          placeholder="Password"
          autoCapitalize="none"
          {...props}
        />

        <Feather
          name={showPassword ? "eye-off" : "eye"}
          size={22}
          color={iconColor}
          onPress={() => setShowPassword((prev) => !prev)}
          style={{ marginLeft: 8 }}
        />
      </View>
    )
  }
)

// Assurez-vous d'avoir le displayName
PasswordInput.displayName = "PasswordInput"