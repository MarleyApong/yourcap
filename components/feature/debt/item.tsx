import { View, Text, Pressable } from "react-native"
import { Link } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"

type Debt = {
  id: string
  name: string
  amount: number
  date: string
  description?: string
}

export default function DebtItem({ debt, type }: { debt: Debt; type: "receive" | "repay" }) {
  const { twColor } = useTwColors()
  const amountColor = type === "receive" ? "text-green-600" : "text-red-600"
  const icon = type === "receive" ? "arrow-down-left" : "arrow-up-right"

  return (
    <Link href={`/debt/[id]?id=${debt.id}`} asChild>
      <Pressable className="bg-white p-4 rounded-lg mb-3 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold">{debt.name}</Text>
            {debt.description && <Text className="text-gray-500">{debt.description}</Text>}
            <Text className="text-gray-400 text-sm">{debt.date}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name={icon} size={20} color={type === "receive" ? twColor("text-green-600") : twColor("text-red-600")} className="mr-2" />
            <Text className={`text-lg font-bold ${amountColor}`}>
              {type === "receive" ? "+" : "-"}${debt.amount}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}
