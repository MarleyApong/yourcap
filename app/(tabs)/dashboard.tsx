import { DebtItem } from "@/components/feature/dashboard/debtItem"
import { QuickActionButton } from "@/components/feature/dashboard/quick-action-button"
import { SummaryCard } from "@/components/feature/dashboard/summary-card"
import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useTheme } from "@/core/theme"
import { isDatabaseReady } from "@/db/db"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { formatCurrency } from "@/lib/utils"
import { requestNotificationPermissions } from "@/services/notificationService"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import { updateSettings } from "@/services/settingsService"
import { useAuthStore } from "@/stores/authStore"
import { Debt } from "@/types/debt"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/core"
import { Link, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const NOTIF_PERMISSION_KEY = "notification_permission_asked"

export default function Dashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [summary, setSummary] = useState({ owing: 0, owed: 0, balance: 0 })
  const [recentDebts, setRecentDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const askNotificationPermission = async () => {
      if (!user) return
      const asked = await AsyncStorage.getItem(NOTIF_PERMISSION_KEY)
      if (asked) return
      await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, "true")
      const granted = await requestNotificationPermissions()
      if (granted) {
        await updateSettings(user.user_id, {
          notification_enabled: true,
          system_notifications: true,
        })
      }
    }
    askNotificationPermission()
  }, [user])

  const loadData = useCallback(async () => {
    if (!user?.user_id) {
      console.log("No user ID available")
      setLoading(false)
      return
    }

    if (!isDatabaseReady()) {
      console.error("Database not ready")
      setError(t("dashboard.errors.databaseNotReady"))
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
      setError(t("dashboard.errors.failedToLoad"))
      Toast.error(t("dashboard.errors.failedToLoad"), t("common.error"))
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

  const handleAddDebt = () => router.push("/debt/add")
  const handleViewHistory = () => router.push("/(tabs)/history")
  const handleViewSettings = () => router.push("/(tabs)/settings")
  const handleDebtPress = (debtId: string) => router.push(`/debt/${debtId}`)
  const handleRetry = () => loadData()

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PageHeader title={t("dashboard.title")} fbackButton={false} textPosition="center" textAlign="left" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {error && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: colors.status.destructive,
                  borderColor: colors.status.destructiveForeground,
                },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.status.destructiveForeground }]}>{error}</Text>
              <Text style={[styles.errorRetry, { color: colors.status.destructiveForeground }]} onPress={handleRetry}>
                {t("dashboard.errors.tapToRetry")}
              </Text>
            </View>
          )}

          {!error && (
            <Animated.View entering={FadeInDown.duration(350).delay(50)} style={styles.summaryRow}>
              <SummaryCard label={t("dashboard.summary.totalLent")} amount={formatCurrency(summary.owed, "XAF")} type="negative" />
              <SummaryCard label={t("dashboard.summary.totalOwed")} amount={formatCurrency(summary.owing, "XAF")} type="positive" />
              <SummaryCard label={t("dashboard.summary.balance")} amount={formatCurrency(summary.balance, "XAF")} type={summary.balance >= 0 ? "positive" : "negative"} />
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.duration(350).delay(150)}
            style={[styles.quickActions, { backgroundColor: colors.card.background, borderColor: colors.border }]}
          >
            <QuickActionButton icon="plus" label={t("dashboard.addDebt")} onPress={handleAddDebt} />
            <QuickActionButton icon="list" label={t("tabs.history")} onPress={handleViewHistory} />
            <QuickActionButton icon="settings" label={t("tabs.settings")} onPress={handleViewSettings} />
          </Animated.View>

          {!error && (
            <Animated.View entering={FadeInDown.duration(350).delay(250)} style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={[styles.recentTitle, { color: colors.foreground.primary }]}>
                  {t("dashboard.quickActions")}
                </Text>
                <Link href="/(tabs)/history">
                  <Text style={[styles.recentLink, { color: colors.primary.default }]}>
                    {t("tabs.history")}
                  </Text>
                </Link>
              </View>

              {loading && <LoadingState message={t("common.loading")} />}

              {!loading && recentDebts.length === 0 && (
                <EmptyState
                  title={t("dashboard.empty.title")}
                  description={t("dashboard.empty.subtitle")}
                  buttonText={t("dashboard.empty.addFirst")}
                  onButtonPress={handleAddDebt}
                  image={require("@/assets/images/empty.png")}
                />
              )}

              {!loading && recentDebts.length > 0 && (
                <View style={[styles.debtList, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  {recentDebts.map((debt, index) => (
                    <Animated.View key={debt.debt_id} entering={FadeInRight.duration(300).delay(300 + index * 60)}>
                      <DebtItem
                        debt={debt}
                        currency={"XAF"}
                        onPress={() => handleDebtPress(debt.debt_id)}
                        showBorder={index !== recentDebts.length - 1}
                      />
                    </Animated.View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  errorBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 14 },
  errorRetry: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  recentSection: { marginTop: 24 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentTitle: { fontSize: 18, fontWeight: "600" },
  recentLink: { fontSize: 14, fontWeight: "500" },
  debtList: { borderRadius: 12, borderWidth: 1 },
})
