import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { Feather } from "@expo/vector-icons"
import { cn } from "@/lib/utils"
import { useTwColors } from "@/lib/tw-colors"

export const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (newValue: boolean) => void }) => {
  const { twColor } = useTwColors()

  return (
    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View className={cn("w-5 h-5 rounded-md border items-center justify-center  bg-primary/10 border-primary", checked ? "border-2" : "")}>
        {checked && <Feather name="check" size={14} color={twColor("text-primary")} />}
      </View>
      <Text className="text-base text-gray-800">{label}</Text>
    </TouchableOpacity>
  )
}
