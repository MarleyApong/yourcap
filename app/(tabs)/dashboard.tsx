import { DebtItem } from "@/components/feature/dashboard/debtItem"
import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { NotificationBanner } from "@/components/feature/notification-banner"
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
import { useCallback, useEffect, useMemo, useState } from "react"
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

const CHIP_COLORS = ["#6C63FF", "#FF6B6B", "#4ECDC4", "#F7B731", "#45B7D1"]

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
        const granted = await requestNotificationPermissions()
        if (granted) await updateSettings(user.user_id, { notification_enabled: true, system_notifications: true })
      } else if (status === "granted") {
        const settings = await getSettings(user.user_id)
        if (!settings?.notification_enabled) await updateSettings(user.user_id, { notification_enabled: true, system_notifications: true })
      }
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

  const attentionItems = useMemo(() => allDebts
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
    .slice(0, 5), [allDebts])

  const recentDebts = useMemo(() => [...allDebts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4), [allDebts])

  // ── Graphique mensuel ──
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { label: d.toLocaleDateString(undefined, { month: "short" }), monthIndex: d.getMonth(), year: d.getFullYear(), total: 0 }
    })
    allDebts.forEach(debt => {
      const created = new Date(debt.created_at)
      const idx = months.findIndex(m => m.monthIndex === created.getMonth() && m.year === created.getFullYear())
      if (idx !== -1) months[idx].total += debt.amount
    })
    return months
  }, [allDebts])

  const maxMonthTotal = useMemo(() => Math.max(...monthlyData.map(m => m.total), 1), [monthlyData])

  // ── Top contacts ──
  const topContacts = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; colorIdx: number }>()
    allDebts.filter(d => d.status !== "PAID").forEach(debt => {
      const key = debt.contact_phone
      const existing = map.get(key)
      if (existing) { existing.total += debt.amount; existing.count++ }
      else map.set(key, { name: debt.contact_name, total: debt.amount, count: 1, colorIdx: map.size % CHIP_COLORS.length })
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 3)
  }, [allDebts])

  // ── Taux de recouvrement ──
  const recovery = useMemo(() => {
    const totalDue = allDebts.reduce((s, d) => s + d.amount, 0)
    const totalPaid = allDebts.reduce((s, d) => s + (d.paid_amount ?? 0), 0)
    const rate = totalDue > 0 ? totalPaid / totalDue : 0
    return { totalDue, totalPaid, rate }
  }, [allDebts])

  const overdueCount = useMemo(() => allDebts.filter(d => d.status === "OVERDUE").length, [allDebts])
  const activeCount = useMemo(() => allDebts.filter(d => d.status !== "PAID").length, [allDebts])
  const firstName = user?.full_name?.split(" ")[0] ?? ""
  const initials = user?.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() ?? "?"

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>

        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: colors.primary.default, paddingTop: insets.top + 12 }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroGreeting}>{getGreeting(t)}{firstName ? `, ${firstName}` : ""} 👋</Text>
              <Text style={styles.heroDate}>
                {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/settings")} style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>

          <View style={styles.heroBalance}>
            <Text style={styles.heroBalanceLabel}>{t("dashboard.balance.net")}</Text>
            <Text style={[styles.heroBalanceAmount, { color: summary.balance >= 0 ? "#6EE7B7" : "#FCA5A5" }]}>
              {summary.balance >= 0 ? "+" : ""}{formatCurrency(summary.balance, "XAF")}
            </Text>
          </View>

          <View style={styles.quickActions}>
            {[
              { icon: "arrow-up-right", label: t("debt.add.debtType.owing"), onPress: () => router.push("/debt/add") },
              { icon: "arrow-down-left", label: t("debt.add.debtType.owed"), onPress: () => router.push("/debt/add") },
              { icon: "list", label: t("dashboard.recent.seeAll"), onPress: () => router.push("/(tabs)/history") },
              { icon: "settings", label: t("settings.title"), onPress: () => router.push("/(tabs)/settings") },
            ].map((item, i) => (
              <Pressable key={i} onPress={item.onPress} style={[styles.quickBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <View style={styles.quickBtnIcon}>
                  <Feather name={item.icon as any} size={16} color="#fff" />
                </View>
                <Text style={styles.quickBtnLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Stats grid 2×2 ── */}
        <Animated.View entering={FadeInDown.duration(350).delay(50)} style={styles.statsGrid}>
          {[
            { icon: "arrow-down-left", color: colors.status.success, amount: formatCurrency(summary.owing, "XAF"), label: t("dashboard.balance.toReceive") },
            { icon: "arrow-up-right", color: colors.status.destructive, amount: formatCurrency(summary.owed, "XAF"), label: t("dashboard.balance.toPay") },
            { icon: "alert-circle", color: overdueCount > 0 ? colors.status.warning : colors.muted.foreground, amount: String(overdueCount), label: t("dashboard.attention.overdue") },
            { icon: "credit-card", color: colors.primary.default, amount: String(activeCount), label: t("dashboard.attention.title") },
          ].map((tile, i) => (
            <View key={i} style={[styles.statTile, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <View style={[styles.statTileIcon, { backgroundColor: tile.color + "18" }]}>
                <Feather name={tile.icon as any} size={15} color={tile.color} />
              </View>
              <Text style={[styles.statTileAmount, { color: tile.color }]} numberOfLines={1}>{tile.amount}</Text>
              <Text style={[styles.statTileLabel, { color: colors.muted.foreground }]}>{tile.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.content}>
          <NotificationBanner />

          {/* ── Graphique mensuel ── */}
          {!loading && allDebts.length > 0 && (
            <Animated.View entering={FadeInDown.duration(350).delay(100)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="bar-chart-2" size={15} color={colors.primary.default} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t("dashboard.monthly.title")}
                  </Text>
                </View>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border, padding: 16 }]}>
                <View style={styles.chartArea}>
                  {monthlyData.map((m, i) => {
                    const barHeight = Math.max(4, (m.total / maxMonthTotal) * 80)
                    const isCurrentMonth = i === monthlyData.length - 1
                    return (
                      <View key={i} style={styles.chartColumn}>
                        <View style={styles.chartBarWrapper}>
                          <View style={[
                            styles.chartBar,
                            {
                              height: barHeight,
                              backgroundColor: isCurrentMonth ? colors.primary.default : colors.primary.default + "40",
                              borderRadius: 4,
                            }
                          ]} />
                        </View>
                        <Text style={[styles.chartLabel, { color: isCurrentMonth ? colors.primary.default : colors.muted.foreground }]}>
                          {m.label}
                        </Text>
                      </View>
                    )
                  })}
                </View>
                {maxMonthTotal > 1 && (
                  <Text style={[styles.chartMaxLabel, { color: colors.muted.foreground }]}>
                    Max : {formatCurrency(maxMonthTotal, "XAF")}
                  </Text>
                )}
              </View>
            </Animated.View>
          )}

          {/* ── Taux de recouvrement ── */}
          {!loading && recovery.totalDue > 0 && (
            <Animated.View entering={FadeInDown.duration(350).delay(150)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="trending-up" size={15} color={colors.primary.default} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t("dashboard.recovery.title")}
                  </Text>
                </View>
                <Text style={[styles.recoveryRate, { color: colors.primary.default }]}>
                  {Math.round(recovery.rate * 100)}%
                </Text>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border, padding: 16 }]}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min(recovery.rate * 100, 100)}%` as any,
                    backgroundColor: recovery.rate >= 0.8 ? colors.status.success : recovery.rate >= 0.4 ? colors.status.warning : colors.status.destructive,
                  }]} />
                </View>
                <View style={styles.recoveryLabels}>
                  <View style={styles.recoveryLabelItem}>
                    <View style={[styles.recoveryDot, { backgroundColor: colors.status.success }]} />
                    <Text style={[styles.recoveryLabelText, { color: colors.muted.foreground }]}>
                      {t("debt.payments.paid")} : {formatCurrency(recovery.totalPaid, "XAF")}
                    </Text>
                  </View>
                  <View style={styles.recoveryLabelItem}>
                    <View style={[styles.recoveryDot, { backgroundColor: colors.border }]} />
                    <Text style={[styles.recoveryLabelText, { color: colors.muted.foreground }]}>
                      Total : {formatCurrency(recovery.totalDue, "XAF")}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* ── Top contacts ── */}
          {!loading && topContacts.length > 0 && (
            <Animated.View entering={FadeInDown.duration(350).delay(200)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="users" size={15} color={colors.primary.default} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t("dashboard.topContacts.title")}
                  </Text>
                </View>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {topContacts.map((contact, i) => {
                  const color = CHIP_COLORS[contact.colorIdx]
                  const initials = contact.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                  return (
                    <View
                      key={i}
                      style={[styles.contactRow, i < topContacts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.contactAvatar, { backgroundColor: color + "22" }]}>
                        <Text style={[styles.contactInitials, { color }]}>{initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.contactName, { color: colors.foreground.primary }]}>{contact.name}</Text>
                        <Text style={[styles.contactCount, { color: colors.muted.foreground }]}>
                          {contact.count} {contact.count > 1 ? t("dashboard.topContacts.debts") : t("dashboard.topContacts.debt")}
                        </Text>
                      </View>
                      <Text style={[styles.contactAmount, { color }]}>{formatCurrency(contact.total, "XAF")}</Text>
                    </View>
                  )
                })}
              </View>
            </Animated.View>
          )}

          {/* ── Attention ── */}
          <Animated.View entering={FadeInDown.duration(350).delay(250)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather name="alert-circle" size={15} color={attentionItems.length > 0 ? colors.status.destructive : colors.muted.foreground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t("dashboard.attention.title")}</Text>
                {attentionItems.length > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: colors.status.destructive }]}>
                    <Text style={[styles.countBadgeText, { color: "#fff" }]}>{attentionItems.length}</Text>
                  </View>
                )}
              </View>
            </View>

            {loading && <LoadingState message={t("common.loading")} />}

            {!loading && attentionItems.length === 0 && (
              <View style={[styles.allClear, { backgroundColor: colors.status.success + "12", borderColor: colors.status.success + "30" }]}>
                <Feather name="check-circle" size={15} color={colors.status.success} />
                <View>
                  <Text style={[styles.allClearTitle, { color: colors.status.success }]}>{t("dashboard.attention.empty")}</Text>
                  <Text style={[styles.allClearDesc, { color: colors.muted.foreground }]}>{t("dashboard.attention.emptyDesc")}</Text>
                </View>
              </View>
            )}

            {!loading && attentionItems.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {attentionItems.map((debt, i) => {
                  const isOverdue = debt.status === "OVERDUE"
                  const days = getDaysUntil(debt.due_date)
                  const urgencyColor = isOverdue ? colors.status.destructive : colors.status.warning
                  const tag = isOverdue ? t("dashboard.attention.overdue")
                    : days === 0 ? t("dashboard.attention.dueToday")
                    : t("dashboard.attention.dueSoon", { days })
                  return (
                    <Pressable
                      key={debt.debt_id}
                      onPress={() => router.push(`/debt/${debt.debt_id}`)}
                      style={[styles.attentionItem, i < attentionItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.attentionDot, { backgroundColor: urgencyColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.attentionName, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
                        <Text style={[styles.attentionAmount, { color: colors.muted.foreground }]}>{formatCurrency(debt.amount, debt.currency)}</Text>
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

          {/* ── Recent ── */}
          <Animated.View entering={FadeInDown.duration(350).delay(350)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t("dashboard.recent.title")}</Text>
              <Pressable onPress={() => router.push("/(tabs)/history")}>
                <Text style={[styles.seeAll, { color: colors.primary.default }]}>{t("dashboard.recent.seeAll")}</Text>
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
                  <Animated.View key={debt.debt_id} entering={FadeInRight.duration(300).delay(400 + index * 60)}>
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
      </ScrollView>

      <Fab onPress={() => router.push("/debt/add")} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  heroGreeting: { fontSize: 18, fontWeight: "700", color: "#fff" },
  heroDate: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2, textTransform: "capitalize" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  heroBalance: { marginBottom: 24 },
  heroBalanceLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  heroBalanceAmount: { fontSize: 36, fontWeight: "800", letterSpacing: -0.5 },
  quickActions: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, alignItems: "center", gap: 8, paddingVertical: 12, borderRadius: 14 },
  quickBtnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  quickBtnLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.85)", textAlign: "center" },

  // Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginTop: 20, marginBottom: 4 },
  statTile: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  statTileIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statTileAmount: { fontSize: 17, fontWeight: "800" },
  statTileLabel: { fontSize: 11, fontWeight: "500" },

  // Content
  content: { paddingHorizontal: 20, marginTop: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  countBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 11, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },

  // Chart
  chartArea: { flexDirection: "row", alignItems: "flex-end", height: 96, gap: 4 },
  chartColumn: { flex: 1, alignItems: "center", gap: 6 },
  chartBarWrapper: { flex: 1, justifyContent: "flex-end", width: "100%" },
  chartBar: { width: "100%" },
  chartLabel: { fontSize: 10, fontWeight: "600" },
  chartMaxLabel: { fontSize: 10, marginTop: 8, textAlign: "right" },

  // Recovery
  recoveryRate: { fontSize: 20, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  progressFill: { height: "100%", borderRadius: 4 },
  recoveryLabels: { flexDirection: "row", justifyContent: "space-between" },
  recoveryLabelItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  recoveryDot: { width: 8, height: 8, borderRadius: 4 },
  recoveryLabelText: { fontSize: 11 },

  // Top contacts
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  contactInitials: { fontSize: 14, fontWeight: "700" },
  contactName: { fontSize: 14, fontWeight: "600" },
  contactCount: { fontSize: 12, marginTop: 1 },
  contactAmount: { fontSize: 14, fontWeight: "700" },

  // Attention
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
