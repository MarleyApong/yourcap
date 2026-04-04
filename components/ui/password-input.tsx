import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { forwardRef, useState } from "react"
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native"

type PasswordInputProps = TextInputProps & {
  containerStyle?: ViewStyle
  iconColor?: string
}

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ containerStyle, iconColor, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const { colors } = useTheme()
    const resolvedIconColor = iconColor ?? colors.primary.default

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          style={[styles.input, { color: colors.foreground.primary }]}
          secureTextEntry={!showPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted.foreground}
          autoCapitalize="none"
          {...props}
        />
        <Feather
          name={showPassword ? "eye-off" : "eye"}
          size={22}
          color={resolvedIconColor}
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.icon}
        />
      </View>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  icon: {
    marginLeft: 8,
  },
})
