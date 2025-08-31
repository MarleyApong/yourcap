import { useState } from "react"
import { Modal, Pressable, Text, View, FlatList } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"

interface Option {
  label: string
  value: string
}

interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  required?: boolean
}

export const SelectInput = ({ label, value, onChange, options, required = false }: SelectInputProps) => {
  const { twColor } = useTwColors()
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <View className="mb-4">
      <Text style={{ color: twColor("foreground") }} className="font-bold text-lg">
        {label}
        {required ? <Text className="text-red-600"> *</Text> : ""}
      </Text>

      {/* Field */}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderBottomColor: twColor("primary"),
        }}
        className="flex-row items-center justify-between border-b p-3"
      >
        <View className="flex-row items-center">
          <Feather name="dollar-sign" size={20} color={twColor("primary")} />
          <Text style={{ color: twColor("foreground") }} className="ml-2">
            {selected ? selected.label : "Select..."}
          </Text>
        </View>
        <Feather name="chevron-down" size={20} color={twColor("muted-foreground")} />
      </Pressable>

      {/* Modal dropdown */}
      <Modal visible={open} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-center">
          <View style={{ backgroundColor: twColor("card-background") }} className="mx-6 rounded-xl p-4">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value)
                    setOpen(false)
                  }}
                  className="p-3 border-b border-gray-200"
                >
                  <Text style={{ color: twColor("foreground") }}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)} className="mt-4 p-3 rounded-lg" style={{ backgroundColor: twColor("primary") }}>
              <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}
