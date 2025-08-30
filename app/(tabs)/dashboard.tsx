import { PageHeader } from "@/components/feature/page-header"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency } from "@/lib/utils"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import { Debt } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Image, Pressable, ScrollView, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { useFocusEffect } from "@react-navigation/core"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ owing: 0, owed: 0, balance: 0 })
  const [recentDebts, setRecentDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { twColor } = useTwColors()
  const insets = useSafeAreaInsets()

  const loadData = useCallback(async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const [summaryData, debts] = await Promise.all([getDebtsSummary(user.user_id), getUserDebts(user.user_id)])

      setSummary(summaryData)
      setRecentDebts(debts.slice(0, 5))
    } catch (error) {
      console.error("Dashboard load error:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.user_id])

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        loadData()
      }
    }, [loadData]),
  )

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
      {/* Header fixe */}
      {/* <PageHeader title="Dashboard" fbackButton={false} textPosition="center" textAlign="left" /> */}

      {/* Contenu scrollable avec padding-top pour éviter le header */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Summary Cards */}
          <View className="flex-row justify-between mt-6">
            <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
              <Text className="text-gray-500 text-sm">You Owe</Text>
              <Text className="text-red-500 text-xl font-bold mt-1">{formatCurrency(summary.owed, user?.settings?.currency)}</Text>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
              <Text className="text-gray-500 text-sm">You're Owed</Text>
              <Text className="text-green-500 text-xl font-bold mt-1">{formatCurrency(summary.owing, user?.settings?.currency)}</Text>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm w-[30%] items-center">
              <Text className="text-gray-500 text-sm">Balance</Text>
              <Text className={`text-xl font-bold mt-1 ${summary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(summary.balance, user?.settings?.currency)}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-around px-6 py-4 bg-white mx-0 mt-6 rounded-xl shadow-sm">
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
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Recent Debts</Text>
              <Link href="/(tabs)/history" className="text-primary text-sm">
                View All
              </Link>
            </View>

            {loading ? (
              <View className="bg-white rounded-xl p-8 shadow-sm items-center justify-center">
                <Text className="text-gray-500">Loading...</Text>
              </View>
            ) : recentDebts.length === 0 ? (
              <View className="bg-white rounded-xl p-8 shadow-sm items-center justify-center">
                <Image source={require("@/assets/images/empty.png")} className="w-40 h-40 opacity-50" />
                <Text className="text-gray-500 mt-4">No debts recorded yet</Text>
                <Pressable onPress={() => router.push("/debt/add")} className="mt-4 bg-primary px-6 py-2 rounded-full">
                  <Text className="text-white">Add Your First Debt</Text>
                </Pressable>
              </View>
            ) : (
              <View className="bg-white rounded-xl shadow-sm">
                {recentDebts.map((debt, index) => (
                  <Pressable
                    key={debt.debt_id}
                    onPress={() => router.push(`/debt/${debt.debt_id}`)}
                    className={`p-4 ${index !== recentDebts.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">{debt.contact_name}</Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {debt.debt_type === "OWING" ? "Owes you" : "You owe"} {formatCurrency(debt.amount, user?.settings?.currency)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`w-3 h-3 rounded-full ${getStatusColor(debt.status)} mr-2`} />
                        <Text className="text-gray-500 capitalize">{debt.status.toLowerCase()}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Espace supplémentaire en bas pour éviter que le contenu soit caché par la tab bar */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      <Toast />
    </View>
  )
}
