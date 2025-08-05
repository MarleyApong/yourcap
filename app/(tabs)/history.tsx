import { useEffect, useState } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { Link, useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { getUserDebts } from "@/services/debtServices"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"
import { Debt, DebtStatus, DebtType } from "@/types/debt"
import Toast from "react-native-toast-message"
import { PageHeader } from "@/components/feature/page-header"

export default function History() {
  const { user } = useAuth()
  const [debts, setDebts] = useState<Debt[]>([])
  const [filter, setFilter] = useState<"ALL" | DebtType>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | DebtStatus>("ALL")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { twColor } = useTwColors()

  useEffect(() => {
    if (user?.user_id) {
      loadDebts()
    }
  }, [user, filter, statusFilter])

  const loadDebts = async () => {
    try {
      setLoading(true)
      let allDebts = await getUserDebts(user!.user_id)

      // Apply filters
      if (filter !== "ALL") {
        allDebts = allDebts.filter((d) => d.debt_type === filter)
      }

      if (statusFilter !== "ALL") {
        allDebts = allDebts.filter((d) => d.status === statusFilter)
      }

      setDebts(allDebts)
    } catch (error) {
      console.error("History load error:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load debts. Please try again.",
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

  const getTypeText = (type: string) => {
    return type === "OWING" ? "Owes you" : "You owe"
  }

  const getTypeColor = (type: string) => {
    return type === "OWING" ? "text-green-600" : "text-red-600"
  }

  return (
    <View className="flex-1 bg-gray-50">
      <PageHeader title="History" textPosition="center" textAlign="left" backPath="/dashboard" />

      <View className="p-6">
        <View className="flex-row justify-end">
          <Pressable onPress={() => router.push("/debt/add")} className="bg-primary p-2 rounded-full">
            <Feather name="plus" size={24} color="white" />
          </Pressable>
        </View>

        {/* Filters */}
        <View className="mt-6 flex-row justify-between">
          <View className="bg-white p-1 rounded-lg border border-primary">
            <Pressable onPress={() => setFilter("ALL")} className={`px-3 py-1 rounded-md ${filter === "ALL" ? "bg-primary" : ""}`}>
              <Text className={filter === "ALL" ? "text-white" : "text-gray-700"}>All</Text>
            </Pressable>
            <Pressable onPress={() => setFilter("OWING")} className={`px-3 py-1 rounded-md ${filter === "OWING" ? "bg-primary" : ""}`}>
              <Text className={filter === "OWING" ? "text-white" : "text-gray-700"}>Owed to me</Text>
            </Pressable>
            <Pressable onPress={() => setFilter("OWED")} className={`px-3 py-1 rounded-md ${filter === "OWED" ? "bg-primary" : ""}`}>
              <Text className={filter === "OWED" ? "text-white" : "text-gray-700"}>I owe</Text>
            </Pressable>
          </View>

          <View className="bg-white p-1 rounded-lg border border-primary">
            <Pressable onPress={() => setStatusFilter("ALL")} className={`px-3 py-1 rounded-md ${statusFilter === "ALL" ? "bg-primary" : ""}`}>
              <Text className={statusFilter === "ALL" ? "text-white" : "text-gray-700"}>All</Text>
            </Pressable>
            <Pressable onPress={() => setStatusFilter("PENDING")} className={`px-3 py-1 rounded-md ${statusFilter === "PENDING" ? "bg-primary" : ""}`}>
              <Text className={statusFilter === "PENDING" ? "text-white" : "text-gray-700"}>Pending</Text>
            </Pressable>
            <Pressable onPress={() => setStatusFilter("PAID")} className={`px-3 py-1 rounded-md ${statusFilter === "PAID" ? "bg-primary" : ""}`}>
              <Text className={statusFilter === "PAID" ? "text-white" : "text-gray-700"}>Paid</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Debts List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      ) : debts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Feather name="file-text" size={48} color={twColor("text-gray-300")} />
          <Text className="text-gray-500 mt-4">No debts found</Text>
          <Pressable onPress={() => router.push("/debt/add")} className="mt-4 bg-primary px-6 py-2 rounded-full">
            <Text className="text-white">Add New Debt</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="px-6 pb-20">
          {debts.map((debt) => (
            <Pressable key={debt.debt_id} onPress={() => router.push(`/debt/${debt.debt_id}`)} className="bg-white p-4 rounded-xl shadow-sm mb-3">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="font-semibold text-lg text-gray-900">{debt.contact_name}</Text>
                  <Text className={`font-medium ${getTypeColor(debt.debt_type)}`}>
                    {getTypeText(debt.debt_type)} {formatCurrency(debt.amount, user?.settings?.currency)}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Loan: {formatDate(debt.loan_date)} | Due: {formatDate(debt.due_date)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full ${getStatusColor(debt.status)} mr-2`} />
                  <Text className="text-gray-500 capitalize">{debt.status.toLowerCase()}</Text>
                </View>
              </View>
              {debt.description && (
                <Text className="text-gray-500 mt-2" numberOfLines={2}>
                  {debt.description}
                </Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
