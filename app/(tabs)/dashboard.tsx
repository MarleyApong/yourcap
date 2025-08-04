import { PageHeader } from "@/components/feature/page-header"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency } from "@/lib/utils"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import { Debt } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Image, Pressable, ScrollView, Text, View } from "react-native"
import Toast from "react-native-toast-message"

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ owing: 0, owed: 0, balance: 0 })
  const [recentDebts, setRecentDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { twColor } = useTwColors()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [summaryData, debts] = await Promise.all([getDebtsSummary(user!.token), getUserDebts(user!.token)])

      setSummary(summaryData)
      setRecentDebts(debts.slice(0, 5))
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500"
      case "OVERDUE":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <PageHeader title="Dashboard" fbackButton={false} textAlign="left" backPath="/dashboard" />
      <View className="px-6">
        {/* Summary Cards */}
        <View className="flex-row justify-between mt-6">
          <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
            <Text className="text-gray-500 text-sm">You Owe</Text>
            <Text className="text-red-500 text-xl font-bold mt-1">{formatCurrency(summary.owed)}</Text>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
            <Text className="text-gray-500 text-sm">You're Owed</Text>
            <Text className="text-green-500 text-xl font-bold mt-1">{formatCurrency(summary.owing)}</Text>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
            <Text className="text-gray-500 text-sm">Balance</Text>
            <Text className={summary.balance >= 0 ? "text-green-500" : "text-red-500" + " text-xl font-bold mt-1"}>{formatCurrency(summary.balance)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row justify-around px-6 py-4 bg-white mx-6 mt-6 rounded-xl shadow-sm">
        <Pressable onPress={() => router.push("/debt/add")} className="items-center">
          <View className="bg-primary/10 p-3 rounded-full">
            <Feather name="plus" size={24} color={twColor("primary")} />
          </View>
          <Text className="mt-2 text-sm text-gray-600">Add Debt</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/history")} className="items-center">
          <View className="bg-primary/10 p-3 rounded-full">
            <Feather name="list" size={24} color={twColor("primary")} />
          </View>
          <Text className="mt-2 text-sm text-gray-600">History</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/settings")} className="items-center">
          <View className="bg-primary/10 p-3 rounded-full">
            <Feather name="settings" size={24} color={twColor("primary")} />
          </View>
          <Text className="mt-2 text-sm text-gray-600">Settings</Text>
        </Pressable>
      </View>

      {/* Recent Debts */}
      <View className="mt-6 px-6 flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">Recent Debts</Text>
          <Link href="/(tabs)/history" className="text-primary text-sm">
            View All
          </Link>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text>Loading...</Text>
          </View>
        ) : recentDebts.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Image source={require("@/assets/images/empty.png")} className="w-40 h-40 opacity-50" />
            <Text className="text-gray-500 mt-4">No debts recorded yet</Text>
            <Pressable onPress={() => router.push("/debt/add")} className="mt-4 bg-primary px-6 py-2 rounded-full">
              <Text className="text-white">Add Your First Debt</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="bg-white rounded-xl p-4 shadow-sm">
            {recentDebts.map((debt) => (
              <Pressable key={debt.debt_id} onPress={() => router.push(`/debt/${debt.debt_id}`)} className="py-3 border-b border-gray-100 last:border-0">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-semibold text-gray-900">{debt.contact_name}</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {debt.debt_type === "OWING" ? "Owes you" : "You owe"} {formatCurrency(debt.amount)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full ${getStatusColor(debt.status)} mr-2`} />
                    <Text className="text-gray-500 capitalize">{debt.status.toLowerCase()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <Toast />
    </View>
  )
}
