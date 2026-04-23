import { DebtItem } from "@/components/feature/dashboard/debtItem"
import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { Fab } from "@/components/ui/fab"
import { useTheme } from "@/core/theme"
import { isDatabaseReady } from "@/db/db"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { formatCurrency } from "@/lib/utils"
import { getDebtsSummary, getUserDebts } from "@/services/debtServices"
import * as Notifications from "expo-notifications"
import { requestNotificationPermissions } from "@/services/notificationService"
import { getSettings, updateSettings } from "@/services/settingsService"
import { useAuthStore } from "@/stores/authStore"
import { Debt } from "@/types/debt"
import { useFocusEffect } from "@react-navigation/core"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"


function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateString)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getGreeting(t: (key: any, params?: any) => string): string {
  const h = new Date().getHours()
  if (h < 12) return t("dashboard.greeting.morning")
  if (h < 18) return t("dashboard.greeting.afternoon")
  return t("dashboard.greeting.evening")
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [summary, setSummary] = useState({ owing: 0, owed: 0, balance: 0 })
  const [allDebts, setAllDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const syncNotificationPermission = async () => {
      if (!user) return
      const { status } = await Notifications.getPermissionsAsync()
      if (status === "undetermined") {
        // Never asked — request and enable if granted
        const granted = await requestNotificationPermissions()
        if (granted) {
          await updateSettings(user.user_id, { notification_enabled: true, system_notifications: true })
        }
      } else if (status === "granted") {
        // OS permission granted — ensure DB is in sync
        const settings = await getSettings(user.user_id)
        if (!settings?.notification_enabled) {
          await updateSettings(user.user_id, { notification_enabled: true, system_notifications: true })
        }
      }
      // status === "denied" → do nothing, user explicitly refused
    }
    syncNotificationPermission()
  }, [user])

  const loadData = useCallback(async () => {
    if (!user?.user_id || !isDatabaseReady()) { setLoading(false); return }
    try {
      setLoading(true)
      const [summaryData, debts] = await Promise.all([
        getDebtsSummary(user.user_id),
        getUserDebts(user.user_id),
      ])
      setSummary(summaryData)
      setAllDebts(debts)
    } catch {
      Toast.error(t("dashboard.errors.failedToLoad"))
    } finally {
      setLoading(false)
    }
  }, [user?.user_id])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  const attentionItems = allDebts
    .filter(d => {
      if (d.status === "PAID") return false
      if (d.status === "OVERDUE") return true
      const days = getDaysUntil(d.due_date)
      return days >= 0 && days <= 7
    })
    .sort((a, b) => {
      if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1
      if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 5)

  const recentDebts = [...allDebts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  const firstName = user?.full_name?.split(" ")[0] ?? ""

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.greeting, { color: colors.foreground.primary }]}>
            {getGreeting(t)}{firstName ? `, ${firstName}` : ""} 👋
          </Text>
          <Text style={[styles.dateText, { color: colors.muted.foreground }]}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </Text>
        </View>

        <View style={styles.content}>

          {/* Balance section */}
          <Animated.View entering={FadeInDown.duration(350).delay(50)} style={styles.balanceSection}>
            <Text style={[styles.balanceNetLabel, { color: colors.muted.foreground }]}>{t("dashboard.balance.net")}</Text>
            <Text style={[styles.balanceNetAmount, { color: summary.balance >= 0 ? colors.status.success : colors.status.destructive }]}>
              {summary.balance >= 0 ? "+" : ""}{formatCurrency(summary.balance, "XAF")}
            </Text>
            <View style={styles.statRow}>
              <View style={[styles.statCard, { backgroundColor: colors.status.success + "14", borderColor: colors.status.success + "30" }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.status.success + "22" }]}>
                  <Feather name="arrow-down-left" size={16} color={colors.status.success} />
                </View>
                <Text style={[styles.statLabel, { color: colors.muted.foreground }]}>{t("dashboard.balance.toReceive")}</Text>
                <Text style={[styles.statAmount, { color: colors.status.success }]}>{formatCurrency(summary.owing, "XAF")}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.status.destructive + "14", borderColor: colors.status.destructive + "30" }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.status.destructive + "22" }]}>
                  <Feather name="arrow-up-right" size={16} color={colors.status.destructive} />
                </View>
                <Text style={[styles.statLabel, { color: colors.muted.foreground }]}>{t("dashboard.balance.toPay")}</Text>
                <Text style={[styles.statAmount, { color: colors.status.destructive }]}>{formatCurrency(summary.owed, "XAF")}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Attention */}
          <Animated.View entering={FadeInDown.duration(350).delay(150)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="alert-circle"
                  size={15}
                  color={attentionItems.length > 0 ? colors.status.destructive : colors.muted.foreground}
                />
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  {t("dashboard.attention.title")}
                </Text>
                {attentionItems.length > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: colors.status.destructive }]}>
                    <Text style={[styles.countBadgeText, { color: colors.status.destructiveForeground }]}>{attentionItems.length}</Text>
                  </View>
                )}
              </View>
            </View>

            {loading && <LoadingState message={t("common.loading")} />}

            {!loading && attentionItems.length === 0 && (
              <View style={[styles.allClear, { backgroundColor: colors.status.success + "12", borderColor: colors.status.success + "30" }]}>
                <Feather name="check-circle" size={15} color={colors.status.success} />
                <View>
                  <Text style={[styles.allClearTitle, { color: colors.status.success }]}>
                    {t("dashboard.attention.empty")}
                  </Text>
                  <Text style={[styles.allClearDesc, { color: colors.muted.foreground }]}>
                    {t("dashboard.attention.emptyDesc")}
                  </Text>
                </View>
              </View>
            )}

            {!loading && attentionItems.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {attentionItems.map((debt, i) => {
                  const isOverdue = debt.status === "OVERDUE"
                  const days = getDaysUntil(debt.due_date)
                  const urgencyColor = isOverdue ? colors.status.destructive : colors.status.warning
                  const tag = isOverdue
                    ? t("dashboard.attention.overdue")
                    : days === 0
                    ? t("dashboard.attention.dueToday")
                    : t("dashboard.attention.dueSoon", { days })
                  return (
                    <Pressable
                      key={debt.debt_id}
                      onPress={() => router.push(`/debt/${debt.debt_id}`)}
                      style={[
                        styles.attentionItem,
                        i < attentionItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.attentionDot, { backgroundColor: urgencyColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.attentionName, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
                        <Text style={[styles.attentionAmount, { color: colors.muted.foreground }]}>
                          {formatCurrency(debt.amount, debt.currency)}
                        </Text>
                      </View>
                      <View style={[styles.attentionTag, { backgroundColor: urgencyColor + "18" }]}>
                        <Text style={[styles.attentionTagText, { color: urgencyColor }]}>{tag}</Text>
                      </View>
                      <Feather name="chevron-right" size={14} color={colors.muted.foreground} style={{ marginLeft: 4 }} />
                    </Pressable>
                  )
                })}
              </View>
            )}
          </Animated.View>

          {/* Recent */}
          <Animated.View entering={FadeInDown.duration(350).delay(250)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                {t("dashboard.recent.title")}
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/history")}>
                <Text style={[styles.seeAll, { color: colors.primary.default }]}>
                  {t("dashboard.recent.seeAll")}
                </Text>
              </Pressable>
            </View>

            {loading && <LoadingState message={t("common.loading")} />}

            {!loading && recentDebts.length === 0 && (
              <EmptyState
                title={t("dashboard.empty.title")}
                description={t("dashboard.empty.subtitle")}
                buttonText={t("dashboard.empty.addFirst")}
                onButtonPress={() => router.push("/debt/add")}
                image={require("@/assets/images/empty.png")}
              />
            )}

            {!loading && recentDebts.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {recentDebts.map((debt, index) => (
                  <Animated.View key={debt.debt_id} entering={FadeInRight.duration(300).delay(300 + index * 60)}>
                    <DebtItem
                      debt={debt}
                      currency={debt.currency}
                      onPress={() => router.push(`/debt/${debt.debt_id}`)}
                      showBorder={index !== recentDebts.length - 1}
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

        </View>
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>
      <Fab onPress={() => router.push("/debt/add")} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "700" },
  dateText: { fontSize: 13, marginTop: 3, textTransform: "capitalize" },
  content: { paddingHorizontal: 20 },
  balanceSection: { marginBottom: 24 },
  balanceNetLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 },
  balanceNetAmount: { fontSize: 38, fontWeight: "800", marginBottom: 16 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statLabel: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
  statAmount: { fontSize: 16, fontWeight: "700" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  countBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 11, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  allClear: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  allClearTitle: { fontSize: 13, fontWeight: "600" },
  allClearDesc: { fontSize: 12, marginTop: 2 },
  attentionItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  attentionDot: { width: 8, height: 8, borderRadius: 4 },
  attentionName: { fontSize: 14, fontWeight: "600" },
  attentionAmount: { fontSize: 12, marginTop: 1 },
  attentionTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  attentionTagText: { fontSize: 11, fontWeight: "600" },
})
