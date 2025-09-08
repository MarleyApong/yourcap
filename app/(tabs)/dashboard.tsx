import { DebtItem } from "@/components/feature/dashboard/debtItem"
import { QuickActionButton } from "@/components/feature/dashboard/quick-action-button"
import { SummaryCard } from "@/components/feature/dashboard/summary-card"
import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { isDatabaseReady } from "@/db/db"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency } from "@/lib/utils"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Debt } from "@/types/debt"
import { useFocusEffect } from "@react-navigation/core"
import { Link, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Dashboard() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState({ owing: 0, owed: 0, balance: 0 })
  const [recentDebts, setRecentDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { twColor } = useTwColors()
  const insets = useSafeAreaInsets()

  const loadData = useCallback(async () => {
    if (!user?.user_id) {
      console.log("No user ID available")
      setLoading(false)
      return
    }

    // Vérifier que la DB est prête
    if (!isDatabaseReady()) {
      console.error("Database not ready")
      setError("Database not ready. Please restart the app.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Loading data for user:", user.user_id)

      const [summaryData, debts] = await Promise.all([getDebtsSummary(user.user_id), getUserDebts(user.user_id)])

      console.log("Loaded summary:", summaryData)
      console.log("Loaded debts:", debts?.length || 0)

      setSummary(summaryData)
      setRecentDebts(debts.slice(0, 5))
    } catch (error) {
      console.error("Dashboard load error:", error)
      setError("Failed to load data. Please try again.")
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
  const handleRetry = () => loadData()

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
          {/* Error State */}
          {error && (
            <View
              className="mt-6 p-4 rounded-xl border"
              style={{
                backgroundColor: twColor("destructive"),
                borderColor: twColor("destructive-foreground"),
              }}
            >
              <Text style={{ color: twColor("destructive-foreground") }} className="text-sm">
                {error}
              </Text>
              <Text style={{ color: twColor("destructive-foreground") }} className="text-sm font-medium mt-2" onPress={handleRetry}>
                Tap to retry
              </Text>
            </View>
          )}

          {/* Summary Cards */}
          {!error && (
            <View className="flex-row justify-between mt-6">
              <SummaryCard label="You Owe" amount={formatCurrency(summary.owed, "XAF")} type="negative" />

              <SummaryCard label="You're Owed" amount={formatCurrency(summary.owing, "XAF")} type="positive" />

              <SummaryCard label="Balance" amount={formatCurrency(summary.balance, "XAF")} type={summary.balance >= 0 ? "positive" : "negative"} />
            </View>
          )}

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
          {!error && (
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
                    <DebtItem key={debt.debt_id} debt={debt} currency={"XAF"} onPress={() => handleDebtPress(debt.debt_id)} showBorder={index !== recentDebts.length - 1} />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom spacing to avoid content being hidden by tab bar */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  )
}
