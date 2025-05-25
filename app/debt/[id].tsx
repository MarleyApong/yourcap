import { View, Text } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function DebtDetails() {
  const { id } = useLocalSearchParams()

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-6">Debt Details #{id}</Text>
      {/* Détails de la dette */}
    </View>
  )
}
