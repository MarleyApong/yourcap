import { useTheme } from "@/core/theme"
import { Pressable, StyleSheet, Text, View } from "react-native"

export const SelectionButtons = ({
  options,
  selectedValue,
  onSelect,
}: {
  options: { value: any; label: string }[]
  selectedValue: any
  onSelect: (value: any) => void
}) => {
  const { colors } = useTheme()
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = selectedValue === option.value
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={[styles.btn, { backgroundColor: selected ? colors.primary.default : colors.secondary.default }]}
          >
            <Text style={[styles.btnText, { color: selected ? colors.primary.foreground : colors.secondary.foreground }]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export const MultipleSelectionButtons = ({
  options,
  selectedValues,
  onSelectionChange,
}: {
  options: { value: string; label: string }[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
}) => {
  const { colors } = useTheme()

  const toggle = (value: string) => {
    if (selectedValues.includes(value)) {
      if (selectedValues.length > 1) onSelectionChange(selectedValues.filter((v) => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = selectedValues.includes(option.value)
        return (
          <Pressable
            key={option.value}
            onPress={() => toggle(option.value)}
            style={[
              styles.btn,
              {
                backgroundColor: selected ? colors.primary.default : colors.secondary.default,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.primary.default : colors.border,
              },
            ]}
          >
            <Text style={[styles.btnText, { color: selected ? colors.primary.foreground : colors.secondary.foreground }]}>
              {option.label}{selected ? " ✓" : ""}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  btnText: { fontSize: 14, fontWeight: "500" },
})
