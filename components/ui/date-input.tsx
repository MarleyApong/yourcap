import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useState } from "react"
import { Pressable, Text, View } from "react-native"

interface DateInputProps {
  label: string
  value: Date
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  required?: boolean
}

export const DateInput = ({ label, value, onChange, minimumDate, maximumDate, required = false }: DateInputProps) => {
  const { twColor } = useTwColors()
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false)
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  return (
    <View className="mb-4">
      <Text style={{ color: twColor("foreground") }} className="font-bold text-lg">
        {label}
        {required ? <Text className="text-red-600"> *</Text> : ""}
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={{
          borderBottomColor: twColor("primary"),
        }}
        className="flex-row items-center justify-between border-b p-3"
      >
        <View className="flex-row items-center">
          <Feather name="calendar" size={20} color={twColor("primary")} />
          <Text style={{ color: twColor("foreground") }} className="ml-2">
            {format(value, "MMM dd, yyyy")}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color={twColor("muted-foreground")} />
      </Pressable>

      {showPicker && <DateTimePicker value={value} mode="date" display="default" onChange={handleDateChange} minimumDate={minimumDate} maximumDate={maximumDate} />}
    </View>
  )
}
