import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getUserDebts } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus, DebtType } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"

export default function History() {
  const { user } = useAuthStore()
  const [debts, setDebts] = useState<Debt[]>([])
  const [filter, setFilter] = useState<"ALL" | DebtType>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | DebtStatus>("ALL")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { twColor } = useTwColors()
  const { t } = useTranslation()

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
      Toast.error(t("history.error"), "Error")
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
    return type === "OWING" ? t("history.debtType.owesYou") : t("history.debtType.youOwe")
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
      <PageHeader title={t("history.title")} textPosition="center" textAlign="left" backPath="/dashboard" className=""/>

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
                {t("history.filters.all")}
              </FilterButton>
              <FilterButton active={filter === "OWING"} onPress={() => setFilter("OWING")}>
                {t("history.filters.owed")}
              </FilterButton>
              <FilterButton active={filter === "OWED"} onPress={() => setFilter("OWED")}>
                {t("history.filters.iOwe")}
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
                {t("history.filters.all")}
              </FilterButton>
              <FilterButton active={statusFilter === "PENDING"} onPress={() => setStatusFilter("PENDING")}>
                {t("history.filters.pending")}
              </FilterButton>
              <FilterButton active={statusFilter === "PAID"} onPress={() => setStatusFilter("PAID")}>
                {t("history.filters.paid")}
              </FilterButton>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 px-6">
          <LoadingState message={t("history.loading")} />
        </View>
      ) : debts.length === 0 ? (
        <View className="flex-1 px-6">
          <EmptyState
            title={t("history.empty.title")}
            description={t("history.empty.description")}
            buttonText={t("history.empty.buttonText")}
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
                    {getTypeText(debt.debt_type)} {formatCurrency(debt.amount, "XAF")}
                  </Text>
                  <Text style={{ color: twColor("muted-foreground") }} className="text-sm mt-1">
                    {t("history.dateLabels.loan")}: {formatDate(debt.loan_date)} | {t("history.dateLabels.due")}: {formatDate(debt.due_date)}
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
    </View>
  )
}
