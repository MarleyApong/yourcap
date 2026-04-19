import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

interface DateInputProps {
  label: string
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  required?: boolean
}

export const DateInput = ({ label, value, onChange, minimumDate, maximumDate, required = false }: DateInputProps) => {
  const { colors } = useTheme()
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false)
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.foreground.primary }]}>
        {label}
        {required ? <Text style={{ color: colors.status.destructive }}> *</Text> : ""}
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.field, { borderBottomColor: colors.primary.default }]}
      >
        <View style={styles.fieldLeft}>
          <Feather name="calendar" size={20} color={colors.primary.default} />
          <Text style={[styles.fieldText, { color: colors.foreground.primary }]}>
            {format(value, "MMM dd, yyyy")}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color={colors.muted.foreground} />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
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
})
