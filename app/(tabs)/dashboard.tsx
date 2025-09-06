import { PageHeader } from "@/components/feature/page-header"
import { useAuthStore } from "@/stores/authStore"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency } from "@/lib/utils"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import { Debt } from "@/types/debt"
import { Link, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/core"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { SummaryCard } from "@/components/feature/dashboard/summary-card"
import { QuickActionButton } from "@/components/feature/dashboard/quick-action-button"
import { LoadingState } from "@/components/feature/loading-state"
import { EmptyState } from "@/components/feature/empty-state"
import { DebtItem } from "@/components/feature/dashboard/debtItem"

export default function Dashboard() {
  const { user } = useAuthStore()
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
      Alert.error("Failed to load data. Please try again.", "Error")
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

  // Quick action handlers
  const handleAddDebt = () => router.push("/debt/add")
  const handleViewHistory = () => router.push("/(tabs)/history")
  const handleViewSettings = () => router.push("/(tabs)/settings")
  const handleDebtPress = (debtId: string) => router.push(`/debt/${debtId}`)

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: twColor("background"),
      }}
    >
      {/* Fixed header */}
      <PageHeader title="Dashboard" fbackButton={false} textPosition="center" textAlign="left" />

      {/* Scrollable content with padding-top to avoid header */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Summary Cards */}
          <View className="flex-row justify-between mt-6">
            <SummaryCard label="You Owe" amount={formatCurrency(summary.owed, user?.settings?.currency)} type="negative" />

            <SummaryCard label="You're Owed" amount={formatCurrency(summary.owing, user?.settings?.currency)} type="positive" />

            <SummaryCard label="Balance" amount={formatCurrency(summary.balance, user?.settings?.currency)} type={summary.balance >= 0 ? "positive" : "negative"} />
          </View>

          {/* Quick Actions */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="flex-row justify-around px-6 py-6 mx-0 mt-6 rounded-xl shadow-sm border"
          >
            <QuickActionButton icon="plus" label="Add Debt" onPress={handleAddDebt} />

            <QuickActionButton icon="list" label="History" onPress={handleViewHistory} />

            <QuickActionButton icon="settings" label="Settings" onPress={handleViewSettings} />
          </View>

          {/* Recent Debts Section */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold">
                Recent Debts
              </Text>
              <Link href="/(tabs)/history">
                <Text style={{ color: twColor("primary") }} className="text-sm font-medium">
                  View All
                </Text>
              </Link>
            </View>

            {/* Loading State */}
            {loading && <LoadingState message="Loading your debts..." />}

            {/* Empty State */}
            {!loading && recentDebts.length === 0 && (
              <EmptyState
                title="No debts recorded yet"
                description="Start tracking your financial relationships by adding your first debt."
                buttonText="Add Your First Debt"
                onButtonPress={handleAddDebt}
                image={require("@/assets/images/empty.png")}
              />
            )}

            {/* Debts List */}
            {!loading && recentDebts.length > 0 && (
              <View
                style={{
                  backgroundColor: twColor("card-background"),
                  borderColor: twColor("border"),
                }}
                className="rounded-xl shadow-sm border"
              >
                {recentDebts.map((debt, index) => (
                  <DebtItem
                    key={debt.debt_id}
                    debt={debt}
                    currency={user?.settings?.currency}
                    onPress={() => handleDebtPress(debt.debt_id)}
                    showBorder={index !== recentDebts.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing to avoid content being hidden by tab bar */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  )
}
