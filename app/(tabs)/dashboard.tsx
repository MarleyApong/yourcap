import { Link } from "expo-router"
import { View, Text, ScrollView } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import DebtItem from "@/components/feature/debt/item"

// Données fictives
const debtsToReceive = [
  { id: "1", name: "Alice Martin", amount: 120, date: "2023-05-15", description: "Dinner" },
  { id: "2", name: "Bob Wilson", amount: 50, date: "2023-05-10", description: "Concert tickets" },
]

const debtsToRepay = [
  { id: "3", name: "Charlie Brown", amount: 75, date: "2023-05-05", description: "Books" },
  { id: "4", name: "Diana Miller", amount: 30, date: "2023-04-28", description: "Taxi" },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-6">Welcome, {user?.name || "User"}!</Text>

      <View className="mb-8">
        <Text className="text-xl font-semibold mb-4">Debts to Receive</Text>
        {debtsToReceive.length === 0 ? (
          <Text className="text-gray-500">No debts to receive</Text>
        ) : (
          debtsToReceive.map((debt) => <DebtItem key={debt.id} debt={debt} type="receive" />)
        )}
      </View>

      <View className="mb-8">
        <Text className="text-xl font-semibold mb-4">Debts to Repay</Text>
        {debtsToRepay.length === 0 ? <Text className="text-gray-500">No debts to repay</Text> : debtsToRepay.map((debt) => <DebtItem key={debt.id} debt={debt} type="repay" />)}
      </View>

      <Link href="/debt/add" className="bg-primary p-4 rounded-lg">
        <Text className="text-white text-center font-semibold">Add New Debt</Text>
      </Link>
    </ScrollView>
  )
}
