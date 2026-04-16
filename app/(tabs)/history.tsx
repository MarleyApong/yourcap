import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getUserDebts } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus, DebtType } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

export default function History() {
  const { user } = useAuthStore()
  const { colors } = useTheme()
  const [debts, setDebts] = useState<Debt[]>([])
  const [filter, setFilter] = useState<"ALL" | DebtType>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | DebtStatus>("ALL")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
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
      case "PAID": return colors.status.success
      case "OVERDUE": return colors.status.destructive
      default: return colors.status.warning
    }
  }

  const getTypeText = (type: string) => {
    return type === "OWING" ? t("history.debtType.owesYou") : t("history.debtType.youOwe")
  }

  const getTypeColor = (type: string) => {
    return type === "OWING" ? colors.status.success : colors.status.destructive
  }

  const FilterButton = ({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      style={[styles.filterBtn, { backgroundColor: active ? colors.primary.default : "transparent" }]}
    >
      <Text style={[styles.filterBtnText, { color: active ? colors.primary.foreground : colors.foreground.primary }]}>
        {children}
      </Text>
    </Pressable>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PageHeader title={t("history.title")} textPosition="center" textAlign="left" backPath="/dashboard" />

      <View style={styles.topBar}>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => router.push("/debt/add")}
            style={[styles.addBtn, { backgroundColor: colors.primary.default }]}
          >
            <Feather name="plus" size={24} color={colors.primary.foreground} />
          </Pressable>
        </View>

        <View style={styles.filtersRow}>
          <View style={[styles.filterGroup, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <View style={styles.filterRow}>
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

          <View style={[styles.filterGroup, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <View style={styles.filterRow}>
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

      {loading ? (
        <View style={styles.stateContainer}>
          <LoadingState message={t("history.loading")} />
        </View>
      ) : debts.length === 0 ? (
        <View style={styles.stateContainer}>
          <EmptyState
            title={t("history.empty.title")}
            description={t("history.empty.description")}
            buttonText={t("history.empty.buttonText")}
            onButtonPress={() => router.push("/debt/add")}
            image={require("@/assets/images/empty.png")}
          />
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {debts.map((debt) => (
            <Pressable
              key={debt.debt_id}
              onPress={() => router.push(`/debt/${debt.debt_id}`)}
              style={[styles.debtCard, { backgroundColor: colors.card.background, borderColor: colors.border }]}
            >
              <View style={styles.debtCardRow}>
                <View style={styles.debtCardInfo}>
                  <Text style={[styles.debtName, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
                  <Text style={[styles.debtType, { color: getTypeColor(debt.debt_type) }]}>
                    {getTypeText(debt.debt_type)} {formatCurrency(debt.amount, "XAF")}
                  </Text>
                  <Text style={[styles.debtDate, { color: colors.muted.foreground }]}>
                    {t("history.dateLabels.loan")}: {formatDate(debt.loan_date)} | {t("history.dateLabels.due")}: {formatDate(debt.due_date)}
                  </Text>
                </View>
                <View style={styles.debtStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(debt.status) }]} />
                  <Text style={[styles.statusText, { color: colors.muted.foreground }]}>
                    {debt.status === "PAID" ? t("debt.status.paid") : debt.status === "OVERDUE" ? t("debt.status.overdue") : t("debt.status.pending")}
                  </Text>
                </View>
              </View>
              {debt.description && (
                <Text style={[styles.debtDesc, { color: colors.muted.foreground }]} numberOfLines={2}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { padding: 24 },
  topBarRight: { flexDirection: "row", justifyContent: "flex-end" },
  addBtn: { padding: 12, borderRadius: 999 },
  filtersRow: { marginTop: 24, flexDirection: "column", gap: 8 },
  filterGroup: { padding: 4, borderRadius: 8, borderWidth: 1 },
  filterRow: { flexDirection: "row" },
  filterBtn: { flex: 1, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  filterBtnText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  stateContainer: { flex: 1, paddingHorizontal: 24 },
  list: { flex: 1, paddingHorizontal: 24 },
  listContent: { paddingBottom: 80 },
  debtCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  debtCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  debtCardInfo: { flex: 1 },
  debtName: { fontWeight: "600", fontSize: 18 },
  debtType: { fontWeight: "500", marginTop: 4 },
  debtDate: { fontSize: 14, marginTop: 4 },
  debtStatus: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, textTransform: "capitalize" },
  debtDesc: { marginTop: 8, fontSize: 14 },
})
