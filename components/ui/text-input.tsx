import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { forwardRef } from "react"
import { StyleSheet, Text, TextInput as RNTextInput, TextInputProps, View, ViewStyle } from "react-native"

interface Props extends TextInputProps {
  label?: string
  icon?: string
  error?: string
  required?: boolean
  containerStyle?: ViewStyle
}

export const TextInput = forwardRef<RNTextInput, Props>(
  ({ label, icon, error, required = false, containerStyle, ...props }, ref) => {
    const { colors } = useTheme()

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.foreground.primary }]}>
            {label}
            {required ? <Text style={{ color: colors.status.destructive }}> *</Text> : ""}
          </Text>
        )}
        <View style={[styles.inputRow, { borderBottomColor: colors.primary.default }]}>
          {icon && <Feather name={icon as any} size={20} color={colors.primary.default} />}
          <RNTextInput
            ref={ref}
            style={[styles.input, { color: colors.foreground.primary }, props.style]}
            placeholderTextColor={colors.muted.foreground}
            {...props}
          />
        </View>
        {error && <Text style={{ color: colors.status.destructive, fontSize: 14, marginTop: 4 }}>{error}</Text>}
      </View>
    )
  }
)

TextInput.displayName = "TextInput"

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
  },
  inputRow: {
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
})
