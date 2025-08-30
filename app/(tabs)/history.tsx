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
import { LoadingState } from "@/components/feature/loading-state"
import { EmptyState } from "@/components/feature/empty-state"

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
        return twColor("success")
      case "OVERDUE":
        return twColor("destructive")
      default:
        return twColor("warning")
    }
  }

  const getTypeText = (type: string) => {
    return type === "OWING" ? "Owes you" : "You owe"
  }

  const getTypeColor = (type: string) => {
    return type === "OWING" ? twColor("success") : twColor("destructive")
  }

  const FilterButton = ({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? twColor("primary") : "transparent",
      }}
      className="px-3 py-2 rounded-md"
    >
      <Text
        style={{
          color: active ? twColor("primary-foreground") : twColor("foreground"),
        }}
        className="text-sm font-medium"
      >
        {children}
      </Text>
    </Pressable>
  )

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: twColor("background"),
      }}
    >
      <PageHeader title="History" textPosition="center" textAlign="left" backPath="/dashboard" />

      <View className="p-6">
        <View className="flex-row justify-end">
          <Pressable
            onPress={() => router.push("/debt/add")}
            style={{
              backgroundColor: twColor("primary"),
            }}
            className="p-3 rounded-full shadow-sm"
          >
            <Feather name="plus" size={24} color={twColor("primary-foreground")} />
          </Pressable>
        </View>

        {/* Filters */}
        <View className="mt-6 flex-row justify-between gap-4">
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="flex-1 p-1 rounded-lg border shadow-sm"
          >
            <View className="flex-row">
              <FilterButton active={filter === "ALL"} onPress={() => setFilter("ALL")}>
                All
              </FilterButton>
              <FilterButton active={filter === "OWING"} onPress={() => setFilter("OWING")}>
                Owed
              </FilterButton>
              <FilterButton active={filter === "OWED"} onPress={() => setFilter("OWED")}>
                I owe
              </FilterButton>
            </View>
          </View>

          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="flex-1 p-1 rounded-lg border shadow-sm"
          >
            <View className="flex-row">
              <FilterButton active={statusFilter === "ALL"} onPress={() => setStatusFilter("ALL")}>
                All
              </FilterButton>
              <FilterButton active={statusFilter === "PENDING"} onPress={() => setStatusFilter("PENDING")}>
                Pending
              </FilterButton>
              <FilterButton active={statusFilter === "PAID"} onPress={() => setStatusFilter("PAID")}>
                Paid
              </FilterButton>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 px-6">
          <LoadingState message="Loading your debts..." />
        </View>
      ) : debts.length === 0 ? (
        <View className="flex-1 px-6">
          <EmptyState
            title="No debts found"
            description="Try adjusting your filters or add your first debt to get started."
            buttonText="Add New Debt"
            onButtonPress={() => router.push("/debt/add")}
            image={require("@/assets/images/empty.png")}
          />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pb-20">
          {debts.map((debt) => (
            <Pressable
              key={debt.debt_id}
              onPress={() => router.push(`/debt/${debt.debt_id}`)}
              style={{
                backgroundColor: twColor("card-background"),
                borderColor: twColor("border"),
              }}
              className="p-4 rounded-xl shadow-sm mb-3 border"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text style={{ color: twColor("foreground") }} className="font-semibold text-lg">
                    {debt.contact_name}
                  </Text>
                  <Text style={{ color: getTypeColor(debt.debt_type) }} className="font-medium mt-1">
                    {getTypeText(debt.debt_type)} {formatCurrency(debt.amount, user?.settings?.currency)}
                  </Text>
                  <Text style={{ color: twColor("muted-foreground") }} className="text-sm mt-1">
                    Loan: {formatDate(debt.loan_date)} | Due: {formatDate(debt.due_date)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ backgroundColor: getStatusColor(debt.status) }} className="w-3 h-3 rounded-full mr-2" />
                  <Text style={{ color: twColor("muted-foreground") }} className="capitalize text-sm">
                    {debt.status.toLowerCase()}
                  </Text>
                </View>
              </View>
              {debt.description && (
                <Text style={{ color: twColor("muted-foreground") }} className="mt-2 text-sm" numberOfLines={2}>
                  {debt.description}
                </Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Toast />
    </View>
  )
}
