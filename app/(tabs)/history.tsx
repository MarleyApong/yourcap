import { EmptyState } from "@/components/feature/empty-state"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { SheetModal } from "@/components/feature/sheet-modal"
import { DateInput } from "@/components/ui/date-input"
import { Fab } from "@/components/ui/fab"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getUserDebts } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus, DebtType } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/core"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

const PAGE_SIZE = 20

export default function History() {
  const { user } = useAuthStore()
  const { colors } = useTheme()
  const [allDebts, setAllDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  // Applied filters
  const [filter, setFilter] = useState<"ALL" | DebtType>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | DebtStatus>("ALL")
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)

  // Pending filters (inside sheet before Apply)
  const [pendingFilter, setPendingFilter] = useState<"ALL" | DebtType>("ALL")
  const [pendingStatus, setPendingStatus] = useState<"ALL" | DebtStatus>("ALL")
  const [pendingDateFrom, setPendingDateFrom] = useState<Date | null>(null)
  const [pendingDateTo, setPendingDateTo] = useState<Date | null>(null)

  const router = useRouter()
  const { t } = useTranslation()

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) loadDebts()
    }, [user])
  )

  const loadDebts = async () => {
    try {
      setLoading(true)
      setAllDebts(await getUserDebts(user!.user_id))
    } catch {
      Toast.error(t("history.error"), "Error")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = allDebts
    if (filter !== "ALL") list = list.filter((d) => d.debt_type === filter)
    if (statusFilter !== "ALL") list = list.filter((d) => d.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (d) => d.contact_name?.toLowerCase().includes(q) || d.contact_phone?.toLowerCase().includes(q)
      )
    }
    if (dateFrom) list = list.filter((d) => d.loan_date && new Date(d.loan_date) >= dateFrom)
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      list = list.filter((d) => d.loan_date && new Date(d.loan_date) <= end)
    }
    return list
  }, [allDebts, filter, statusFilter, search, dateFrom, dateTo])

  const displayed = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])

  const activeFilterCount =
    (filter !== "ALL" ? 1 : 0) +
    (statusFilter !== "ALL" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  const openSheet = () => {
    setPendingFilter(filter)
    setPendingStatus(statusFilter)
    setPendingDateFrom(dateFrom)
    setPendingDateTo(dateTo)
    setFilterSheetVisible(true)
  }

  const applyFilters = () => {
    setFilter(pendingFilter)
    setStatusFilter(pendingStatus)
    setDateFrom(pendingDateFrom)
    setDateTo(pendingDateTo)
    setPage(1)
    setFilterSheetVisible(false)
  }

  const resetFilters = () => {
    setPendingFilter("ALL")
    setPendingStatus("ALL")
    setPendingDateFrom(null)
    setPendingDateTo(null)
    setFilter("ALL")
    setStatusFilter("ALL")
    setDateFrom(null)
    setDateTo(null)
    setPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return colors.status.success
      case "OVERDUE": return colors.status.destructive
      default: return colors.status.warning
    }
  }

  const getTypeText = (type: string) =>
    type === "OWING" ? t("history.debtType.owesYou") : t("history.debtType.youOwe")

  const getTypeColor = (type: string) =>
    type === "OWING" ? colors.status.success : colors.status.destructive

  // Chip used inside the filter sheet
  const Chip = ({
    active, onPress, label,
  }: { active: boolean; onPress: () => void; label: string }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.primary.default : colors.card.background, borderColor: active ? colors.primary.default : colors.border },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.primary.foreground : colors.foreground.primary }]}>
        {label}
      </Text>
    </Pressable>
  )

  const renderDebt = useCallback(({ item: debt }: { item: Debt }) => (
    <Pressable
      onPress={() => router.push(`/debt/${debt.debt_id}`)}
      style={[styles.debtCard, { backgroundColor: colors.card.background, borderColor: colors.border }]}
    >
      <View style={styles.debtCardRow}>
        <View style={styles.debtCardInfo}>
          <Text style={[styles.debtName, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
          <Text style={[styles.debtType, { color: getTypeColor(debt.debt_type) }]}>
            {getTypeText(debt.debt_type)} {formatCurrency(debt.amount, debt.currency || "XAF")}
          </Text>
          <Text style={[styles.debtDate, { color: colors.muted.foreground }]}>
            {t("history.dateLabels.loan")}: {formatDate(debt.loan_date)} | {t("history.dateLabels.due")}: {formatDate(debt.due_date)}
          </Text>
        </View>
        <View style={styles.debtStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(debt.status) }]} />
          <Text style={[styles.statusText, { color: colors.muted.foreground }]}>
            {debt.status === "PAID"
              ? t("debt.status.paid")
              : debt.status === "OVERDUE"
              ? t("debt.status.overdue")
              : t("debt.status.pending")}
          </Text>
        </View>
      </View>
      {debt.description && (
        <Text style={[styles.debtDesc, { color: colors.muted.foreground }]} numberOfLines={2}>
          {debt.description}
        </Text>
      )}
    </Pressable>
  ), [colors, router, t])

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PageHeader title={t("history.title")} textPosition="center" textAlign="left" backPath="/dashboard" />

      {/* Fixed search bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.muted.foreground} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={(v) => { setSearch(v); setPage(1) }}
            placeholder={t("history.search")}
            placeholderTextColor={colors.muted.foreground}
            style={[styles.searchInput, { color: colors.foreground.primary }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(""); setPage(1) }} style={styles.searchClear}>
              <Feather name="x" size={15} color={colors.muted.foreground} />
            </Pressable>
          )}
          <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
          <Pressable onPress={openSheet} style={styles.filterIconBtn}>
            <Feather
              name="sliders"
              size={16}
              color={activeFilterCount > 0 ? colors.primary.default : colors.muted.foreground}
            />
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary.default }]}>
                <Text style={[styles.filterBadgeText, { color: colors.primary.foreground }]}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <LoadingState message={t("history.loading")} />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.debt_id.toString()}
          renderItem={renderDebt}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                title={t("history.empty.title")}
                description={t("history.empty.description")}
                buttonText={t("history.empty.buttonText")}
                onButtonPress={() => router.push("/debt/add")}
                image={require("@/assets/images/empty.png")}
              />
            </View>
          }
          onEndReached={() => {
            if (displayed.length < filtered.length) setPage((p) => p + 1)
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            displayed.length < filtered.length ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primary.default} />
              </View>
            ) : null
          }
        />
      )}

      <Fab onPress={() => router.push("/debt/add")} />

      {/* Unified filter sheet */}
      <SheetModal
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        title={t("history.advancedFilters")}
        actionLabel={t("history.applyFilters")}
        onAction={applyFilters}
      >
        <View style={styles.sheetContent}>
          {/* Type */}
          <Text style={[styles.sheetLabel, { color: colors.foreground.primary }]}>
            {t("history.filters.owed")} / {t("history.filters.iOwe")}
          </Text>
          <View style={styles.chipRow}>
            <Chip active={pendingFilter === "ALL"} onPress={() => setPendingFilter("ALL")} label={t("history.filters.all")} />
            <Chip active={pendingFilter === "OWING"} onPress={() => setPendingFilter("OWING")} label={t("history.filters.owed")} />
            <Chip active={pendingFilter === "OWED"} onPress={() => setPendingFilter("OWED")} label={t("history.filters.iOwe")} />
          </View>

          {/* Status */}
          <Text style={[styles.sheetLabel, { color: colors.foreground.primary, marginTop: 12 }]}>
            {t("history.filters.pending")} / {t("history.filters.paid")}
          </Text>
          <View style={styles.chipRow}>
            <Chip active={pendingStatus === "ALL"} onPress={() => setPendingStatus("ALL")} label={t("history.filters.all")} />
            <Chip active={pendingStatus === "PENDING"} onPress={() => setPendingStatus("PENDING")} label={t("history.filters.pending")} />
            <Chip active={pendingStatus === "PAID"} onPress={() => setPendingStatus("PAID")} label={t("history.filters.paid")} />
          </View>

          {/* Date range */}
          <Text style={[styles.sheetLabel, { color: colors.foreground.primary, marginTop: 12 }]}>
            {t("history.dateRange")}
          </Text>
          <DateInput
            label={t("history.dateFrom")}
            value={pendingDateFrom ?? new Date()}
            onChange={setPendingDateFrom}
            maximumDate={pendingDateTo ?? undefined}
          />
          <DateInput
            label={t("history.dateTo")}
            value={pendingDateTo ?? new Date()}
            onChange={setPendingDateTo}
            minimumDate={pendingDateFrom ?? undefined}
          />

          {/* Reset */}
          {(pendingFilter !== "ALL" || pendingStatus !== "ALL" || pendingDateFrom || pendingDateTo) && (
            <Pressable onPress={resetFilters} style={styles.resetBtn}>
              <Feather name="x-circle" size={14} color={colors.muted.foreground} />
              <Text style={[styles.resetText, { color: colors.muted.foreground }]}>
                {t("history.resetFilters")}
              </Text>
            </Pressable>
          )}
        </View>
      </SheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  searchClear: { padding: 4 },
  searchDivider: { width: 1, height: 18, marginHorizontal: 8 },
  filterIconBtn: { padding: 6, position: "relative" },
  filterBadge: {
    position: "absolute", top: 1, right: 1,
    width: 14, height: 14, borderRadius: 7,
    alignItems: "center", justifyContent: "center",
  },
  filterBadgeText: { fontSize: 9, fontWeight: "700" },
  stateContainer: { flex: 1, paddingHorizontal: 24 },
  listContent: { paddingHorizontal: 24, paddingBottom: 96 },
  emptyContainer: { paddingTop: 16 },
  footer: { paddingVertical: 16, alignItems: "center" },
  debtCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  debtCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  debtCardInfo: { flex: 1 },
  debtName: { fontWeight: "600", fontSize: 18 },
  debtType: { fontWeight: "500", marginTop: 4 },
  debtDate: { fontSize: 14, marginTop: 4 },
  debtStatus: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, textTransform: "capitalize" },
  debtDesc: { marginTop: 8, fontSize: 14 },
  sheetContent: { paddingHorizontal: 4, paddingTop: 4 },
  sheetLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  resetText: { fontSize: 14 },
})
