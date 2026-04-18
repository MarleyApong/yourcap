import { PageHeader } from "@/components/feature/page-header"
import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { TextInput } from "@/components/ui/text-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteDebt, getDebtById, updateDebt } from "@/services/debtServices"
import { scheduleAllDebtReminders } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export default function DebtDetails() {
  const { id } = useLocalSearchParams()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    amount: "",
    currency: "XAF",
    description: "",
    loan_date: new Date(),
    due_date: new Date(),
    debt_type: "OWING" as "OWING" | "OWED",
  })
  const router = useRouter()

  useEffect(() => {
    if (user && user.user_id) {
      loadDebt()
    } else {
      router.replace("/auth/login")
    }
  }, [id, user])

  const loadDebt = async () => {
    if (!user) return

    try {
      setLoading(true)
      const debtData = await getDebtById(id as string)

      if (debtData && debtData.user_id === user.user_id) {
        setDebt(debtData)
        setEditForm({
          contact_name: debtData.contact_name,
          contact_phone: debtData.contact_phone || "",
          contact_email: debtData.contact_email || "",
          amount: debtData.amount.toString(),
          currency: debtData.currency || "XAF",
          description: debtData.description || "",
          loan_date: new Date(debtData.loan_date),
          due_date: new Date(debtData.due_date),
          debt_type: debtData.debt_type,
        })
      } else {
        Toast.error(t("debt.details.notFound"), t("common.error"))
        router.back()
      }
    } catch (error) {
      Toast.error(t("debt.details.failedToLoad"), t("common.error"))
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: DebtStatus) => {
    try {
      await updateDebt(debt!.debt_id, { status: newStatus })
      loadDebt()
      scheduleAllDebtReminders(user!.user_id)
      Toast.success(t("debt.details.statusUpdated"), t("common.success"))
    } catch (error) {
      Toast.error(t("debt.details.statusUpdateFailed"), t("common.error"))
    }
  }

  const handleDelete = () => {
    Toast.confirm(
      t("debt.delete.confirmMessage"),
      async () => {
        try {
          await deleteDebt(debt!.debt_id, user!.user_id)
          Toast.success(t("debt.details.deleteSuccess"), t("common.success"))
          router.back()
        } catch (error) {
          Toast.error(t("debt.details.deleteFailed"), t("common.error"))
        }
      },
      {
        title: t("debt.delete.title"),
        confirmText: t("debt.delete.confirm"),
        cancelText: t("debt.delete.cancel"),
      },
    )
  }

  const handleCall = () => {
    if (debt?.contact_phone) {
      Linking.openURL(`tel:${debt.contact_phone}`)
    }
  }

  const handleSMS = () => {
    if (debt?.contact_phone) {
      const amount = formatCurrency(debt.amount, debt.currency || "XAF")
      const params = {
        name: debt.contact_name,
        amount,
        loanDate: formatDate(debt.loan_date),
        dueDate: formatDate(debt.due_date),
      }
      const message =
        debt.debt_type === "OWING"
          ? t("debt.details.messages.smsOwing", params)
          : t("debt.details.messages.smsOwed", params)
      Linking.openURL(`sms:${debt.contact_phone}?body=${encodeURIComponent(message)}`)
    }
  }

  const handleEmail = () => {
    if (debt?.contact_email) {
      const amount = formatCurrency(debt.amount, debt.currency || "XAF")
      const params = {
        name: debt.contact_name,
        amount,
        loanDate: formatDate(debt.loan_date),
        dueDate: formatDate(debt.due_date),
      }
      const subject =
        debt.debt_type === "OWING"
          ? t("debt.details.messages.emailSubjectOwing", params)
          : t("debt.details.messages.emailSubjectOwed", params)
      const body =
        debt.debt_type === "OWING"
          ? t("debt.details.messages.emailBodyOwing", params)
          : t("debt.details.messages.emailBodyOwed", params)
      Linking.openURL(`mailto:${debt.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    }
  }

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleEditDateChange = (field: "loan_date" | "due_date") => (date: Date) => {
    setEditForm({ ...editForm, [field]: date })
  }

  const validateEditForm = () => {
    if (!editForm.contact_name.trim()) {
      Toast.error(t("debt.add.validation.nameRequired"), t("common.error"))
      return false
    }

    if (!editForm.contact_phone.trim()) {
      Toast.error(t("debt.add.validation.phoneRequired"), t("common.error"))
      return false
    }

    if (!editForm.amount.trim()) {
      Toast.error(t("debt.add.validation.amountRequired"), t("common.error"))
      return false
    }

    const amount = Number(editForm.amount)
    if (isNaN(amount) || amount <= 0) {
      Toast.error(t("debt.add.validation.invalidAmount"), t("common.error"))
      return false
    }

    if (editForm.due_date < editForm.loan_date) {
      Toast.error(t("debt.add.validation.invalidDueDate"), t("common.error"))
      return false
    }

    return true
  }

  const handleEditSubmit = async () => {
    if (!validateEditForm()) return

    setEditLoading(true)
    try {
      await updateDebt(debt!.debt_id, {
        contact_name: editForm.contact_name.trim(),
        contact_phone: editForm.contact_phone.trim(),
        contact_email: editForm.contact_email.trim() || undefined,
        amount: Number(editForm.amount),
        currency: editForm.currency,
        description: editForm.description.trim() || undefined,
        loan_date: editForm.loan_date.toISOString(),
        due_date: editForm.due_date.toISOString(),
        debt_type: editForm.debt_type,
      })

      Toast.success(t("debt.details.updateSuccess"), t("common.success"))
      setEditModalVisible(false)
      loadDebt()
      scheduleAllDebtReminders(user!.user_id)
    } catch (error) {
      console.error("Error updating debt:", error)
      Toast.error(t("debt.details.updateFailed"), t("common.error"))
    } finally {
      setEditLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (debt?.status) {
      case "PAID": return colors.status.success
      case "OVERDUE": return colors.status.destructive
      default: return colors.status.warning
    }
  }

  const getTypeText = () => {
    return debt?.debt_type === "OWING" ? t("history.debtType.owesYou") : t("history.debtType.youOwe")
  }

  const getStatusText = () => {
    switch (debt?.status) {
      case "PAID": return t("debt.status.paid")
      case "OVERDUE": return t("debt.status.overdue")
      default: return t("debt.status.pending")
    }
  }

  const getTypeColor = () => {
    return debt?.debt_type === "OWING" ? colors.status.success : colors.status.destructive
  }

  if (loading || !debt) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <Loader />
        <Text style={[styles.loadingText, { color: colors.foreground.primary }]}>{t("debt.details.loading")}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PageHeader title={t("debt.details.title")} textPosition="center" textAlign="left" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Card */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border, marginBottom: 24 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderInfo}>
                <Text style={[styles.contactName, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
                <Text style={[styles.debtAmount, { color: getTypeColor() }]}>
                  {getTypeText()} {formatCurrency(debt.amount, debt.currency || "XAF")}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: colors.background.primary, borderColor: colors.border }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: colors.foreground.primary }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            <View style={styles.contactActions}>
              {debt.contact_phone && (
                <>
                  <Pressable
                    onPress={handleCall}
                    style={[styles.contactBtn, { backgroundColor: colors.status.success + "20" }]}
                  >
                    <Feather name="phone" size={16} color={colors.status.success} />
                    <Text style={[styles.contactBtnText, { color: colors.status.success }]}>{t("debt.details.call")}</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSMS}
                    style={[styles.contactBtn, { backgroundColor: colors.primary.default + "20" }]}
                  >
                    <Feather name="message-square" size={16} color={colors.primary.default} />
                    <Text style={[styles.contactBtnText, { color: colors.primary.default }]}>{t("debt.details.sms")}</Text>
                  </Pressable>
                </>
              )}

              {debt.contact_email && (
                <Pressable
                  onPress={handleEmail}
                  style={[styles.contactBtn, { backgroundColor: colors.status.warning + "20" }]}
                >
                  <Feather name="mail" size={16} color={colors.status.warning} />
                  <Text style={[styles.contactBtnText, { color: colors.status.warning }]}>{t("debt.details.email")}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Details Card */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary.default }]}>{t("debt.details.infoTitle")}</Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.dueDate")}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.due_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.loanDate")}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.loan_date)}</Text>
            </View>

            {debt.contact_phone && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.phoneNumber")}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.contact_phone}</Text>
              </View>
            )}

            {debt.contact_email && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.email")}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.contact_email}</Text>
              </View>
            )}

            {debt.description && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.description")}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.description}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>{t("debt.details.createdOn")}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.created_at)}</Text>
            </View>
          </View>

          {/* Status Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary.default, marginBottom: 8 }]}>{t("debt.details.statusActions")}</Text>

            {debt.status !== "PAID" && (
              <Pressable
                onPress={() => handleStatusChange("PAID")}
                style={[styles.actionBtn, { backgroundColor: colors.status.success }]}
              >
                <Feather name="check-circle" size={20} color={colors.status.successForeground} />
                <Text style={[styles.actionBtnText, { color: colors.status.successForeground }]}>{t("debt.details.markAsPaid")}</Text>
              </Pressable>
            )}

            {debt.status !== "OVERDUE" && debt.status !== "PAID" && (
              <Pressable
                onPress={() => handleStatusChange("OVERDUE")}
                style={[styles.actionBtn, { backgroundColor: colors.status.warning }]}
              >
                <Feather name="alert-triangle" size={20} color={colors.status.warningForeground} />
                <Text style={[styles.actionBtnText, { color: colors.status.warningForeground }]}>{t("debt.details.markAsOverdue")}</Text>
              </Pressable>
            )}

            {debt.status === "OVERDUE" && (
              <Pressable
                onPress={() => handleStatusChange("PENDING")}
                style={[styles.actionBtn, styles.actionBtnNeutral, { borderColor: colors.border }]}
              >
                <Feather name="clock" size={18} color={colors.foreground.primary} />
                <Text style={[styles.actionBtnText, { color: colors.foreground.primary }]}>{t("debt.details.markAsPending")}</Text>
              </Pressable>
            )}

            {debt.status !== "PAID" && (
              <Pressable
                onPress={() => setEditModalVisible(true)}
                style={[styles.actionBtn, styles.actionBtnNeutral, { borderColor: colors.border }]}
              >
                <Feather name="edit" size={18} color={colors.foreground.primary} />
                <Text style={[styles.actionBtnText, { color: colors.foreground.primary }]}>{t("debt.details.editDebt")}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleDelete}
              style={[styles.actionBtn, { backgroundColor: colors.status.destructive }]}
            >
              <Feather name="trash-2" size={20} color={colors.status.destructiveForeground} />
              <Text style={[styles.actionBtnText, { color: colors.status.destructiveForeground }]}>{t("debt.details.deleteDebt")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.header.background, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.header.foreground }]}>{t("debt.details.editTitle")}</Text>
            <Pressable onPress={() => setEditModalVisible(false)}>
              <Feather name="x" size={24} color={colors.foreground.primary} />
            </Pressable>
          </View>

          <KeyboardAwareScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            enableOnAndroid
            extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.formGroup}>
                {/* Debt Type Display */}
                <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.primary.default }]}>
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>{t("debt.add.debtType.title")}</Text>

                  <View style={[styles.toggleRow, { borderColor: colors.primary.default }]}>
                    <View
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: editForm.debt_type === "OWING" ? colors.primary.default + "40" : colors.muted.default + "20" },
                      ]}
                    >
                      <Text style={{ color: editForm.debt_type === "OWING" ? colors.primary.default : colors.muted.foreground, fontWeight: "500" }}>
                        {t("debt.add.debtType.owing")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: editForm.debt_type === "OWED" ? colors.primary.default + "40" : colors.muted.default + "20" },
                      ]}
                    >
                      <Text style={{ color: editForm.debt_type === "OWED" ? colors.primary.default : colors.muted.foreground, fontWeight: "500" }}>
                        {t("debt.add.debtType.owed")}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.descBox, { backgroundColor: colors.muted.default + "40" }]}>
                    <Text style={[styles.descText, { color: colors.muted.foreground }]}>
                      {editForm.debt_type === "OWING"
                        ? t("debt.add.debtType.owingDescription")
                        : t("debt.add.debtType.owedDescription")}
                    </Text>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>{t("debt.add.contact.title")}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.muted.foreground }]}>
                    {t("debt.add.contact.subtitle")}
                  </Text>

                  <TextInput
                    label={t("debt.add.contact.fullName")}
                    required
                    placeholder={t("debt.add.namePlaceholder")}
                    value={editForm.contact_name}
                    onChangeText={(text) => handleEditChange("contact_name", text)}
                    icon="user"
                  />

                  <TextInput
                    label={t("debt.add.contact.phone")}
                    placeholder={t("debt.add.contact.phonePlaceholder")}
                    value={editForm.contact_phone}
                    onChangeText={(text) => handleEditChange("contact_phone", text)}
                    keyboardType="phone-pad"
                    icon="phone"
                    required
                  />

                  <TextInput
                    label={t("debt.add.contact.email")}
                    placeholder={t("debt.add.contact.emailPlaceholder")}
                    value={editForm.contact_email}
                    onChangeText={(text) => handleEditChange("contact_email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail"
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>

                {/* Debt Details */}
                <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>{t("debt.add.financial.title")}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.muted.foreground }]}>
                    {t("debt.add.financial.subtitle")}
                  </Text>

                  <TextInput
                    label={t("debt.add.amount")}
                    required
                    placeholder={t("debt.add.amountPlaceholder")}
                    value={editForm.amount}
                    onChangeText={(text) => handleEditChange("amount", text)}
                    keyboardType="numeric"
                    icon="credit-card"
                  />

                  <SelectInput
                    label={t("debt.add.financial.currency")}
                    value={editForm.currency}
                    onChange={(val) => handleEditChange("currency", val)}
                    options={[
                      { label: "XAF (CFA Franc)", value: "XAF" },
                      { label: "USD (US Dollar)", value: "USD" },
                      { label: "EUR (Euro)", value: "EUR" },
                      { label: "GBP (British Pound)", value: "GBP" },
                    ]}
                  />

                  <DateInput
                    label={t("debt.add.financial.loanDate")}
                    value={editForm.loan_date}
                    onChange={handleEditDateChange("loan_date")}
                    maximumDate={new Date()}
                    required
                  />

                  <DateInput
                    label={t("debt.add.financial.dueDate")}
                    value={editForm.due_date}
                    onChange={handleEditDateChange("due_date")}
                    minimumDate={editForm.loan_date}
                    required
                  />

                  <TextInput
                    label={t("debt.add.descriptionOptional")}
                    placeholder={t("debt.add.descriptionPlaceholder")}
                    value={editForm.description}
                    onChangeText={(text) => handleEditChange("description", text)}
                    multiline
                    numberOfLines={3}
                    icon="file-text"
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>

                <Pressable
                  onPress={handleEditSubmit}
                  disabled={editLoading}
                  style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: editLoading ? 0.7 : 1 }]}
                >
                  {editLoading ? <Loader /> : <Feather name="check" size={20} color={colors.primary.foreground} />}
                  <Text style={[styles.submitBtnText, { color: colors.primary.foreground }]}>
                    {editLoading ? t("debt.details.saving") : t("debt.details.saveChanges")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cardHeaderInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: "700" },
  debtAmount: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { textTransform: "capitalize", fontSize: 13, fontWeight: "500" },
  contactActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  contactBtnText: { marginLeft: 6, fontWeight: "500", fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  detailRow: { marginBottom: 16 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 15, marginTop: 2 },
  actionsSection: { marginTop: 24, gap: 10 },
  actionBtn: { padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  actionBtnNeutral: { backgroundColor: "transparent", borderWidth: 1 },
  actionBtnText: { marginLeft: 8, fontWeight: "600", fontSize: 14 },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  formGroup: { marginTop: 24, gap: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  cardSubtitle: { fontSize: 13, marginBottom: 14 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  toggleBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 8 },
  descBox: { padding: 12, borderRadius: 8 },
  descText: { fontSize: 14, lineHeight: 20 },
  submitBtn: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { textAlign: "center", fontWeight: "600", fontSize: 15 },
})
