import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native"

interface Option {
  label: string
  value: string
}

interface SelectInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  required?: boolean
}

export const SelectInput = ({ label, value, onChange, options, required = false }: SelectInputProps) => {
  const { colors } = useTheme()
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <View style={styles.container}>
      {(label || required) && (
        <Text style={[styles.label, { color: colors.foreground.primary }]}>
          {label}
          {required ? <Text style={{ color: colors.status.destructive }}> *</Text> : ""}
        </Text>
      )}

      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { borderBottomColor: colors.primary.default }]}
      >
        <View style={styles.fieldLeft}>
          <Feather name="dollar-sign" size={20} color={colors.primary.default} />
          <Text style={[styles.fieldText, { color: colors.foreground.primary }]}>
            {selected ? selected.label : "Select..."}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color={colors.muted.foreground} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.card.background }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value)
                    setOpen(false)
                  }}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                >
                  <Text style={{ color: colors.foreground.primary }}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable
              onPress={() => setOpen(false)}
              style={[styles.cancelBtn, { backgroundColor: colors.primary.default }]}
            >
              <Text style={[styles.cancelText, { color: colors.primary.foreground }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
  },
  field: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  fieldLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldText: {
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  sheet: {
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
  },
  cancelBtn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "600",
  },
})
