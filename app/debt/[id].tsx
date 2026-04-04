import { PageHeader } from "@/components/feature/page-header"
import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { TextInput } from "@/components/ui/text-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteDebt, getDebtById, updateDebt } from "@/services/debtServices"
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
        Toast.error("Debt not found or access denied", "Error")
        router.back()
      }
    } catch (error) {
      Toast.error("Failed to load debt details", "Error")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: DebtStatus) => {
    try {
      await updateDebt(debt!.debt_id, { status: newStatus })
      loadDebt()
      Toast.success("Debt status updated successfully", "Success")
    } catch (error) {
      Toast.error("Failed to update status", "Error")
    }
  }

  const handleDelete = () => {
    Toast.confirm(
      "This action cannot be undone. The debt record will be permanently deleted.",
      async () => {
        try {
          await deleteDebt(debt!.debt_id)
          Toast.success("Debt deleted successfully", "Success")
          router.back()
        } catch (error) {
          Toast.error("Failed to delete debt", "Error")
        }
      },
      {
        title: "Delete Debt Record?",
        confirmText: "Delete",
        cancelText: "Cancel",
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
      const message =
        debt.debt_type === "OWING"
          ? `Hi ${debt.contact_name}, this is a friendly reminder about the ${formatCurrency(debt.amount, debt.currency)} you borrowed on ${formatDate(debt.loan_date)}. The due date is ${formatDate(debt.due_date)}. Please let me know when you can settle this. Thanks!`
          : `Hi ${debt.contact_name}, I wanted to confirm that I owe you ${formatCurrency(debt.amount, debt.currency)} from ${formatDate(debt.loan_date)}. I plan to repay by ${formatDate(debt.due_date)}. Thank you for your patience.`

      Linking.openURL(`sms:${debt.contact_phone}?body=${encodeURIComponent(message)}`)
    }
  }

  const handleEmail = () => {
    if (debt?.contact_email) {
      const subject =
        debt.debt_type === "OWING"
          ? `Payment Reminder - ${formatCurrency(debt.amount, debt.currency)}`
          : `Payment Confirmation - ${formatCurrency(debt.amount, debt.currency)}`

      const body =
        debt.debt_type === "OWING"
          ? `Dear ${debt.contact_name},\n\nI hope this email finds you well. This is a friendly reminder regarding the ${formatCurrency(debt.amount, debt.currency)} loan from ${formatDate(debt.loan_date)}.\n\nThe agreed due date is ${formatDate(debt.due_date)}. Please let me know your payment plan at your earliest convenience.\n\nBest regards`
          : `Dear ${debt.contact_name},\n\nI wanted to acknowledge that I owe you ${formatCurrency(debt.amount, debt.currency)} from ${formatDate(debt.loan_date)}.\n\nI plan to settle this by ${formatDate(debt.due_date)}. Please let me know if you need to discuss any payment arrangements.\n\nBest regards`

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
      Toast.error("Contact name is required", "Validation Error")
      return false
    }

    if (!editForm.contact_phone.trim()) {
      Toast.error("Phone number is required", "Validation Error")
      return false
    }

    if (!editForm.amount.trim()) {
      Toast.error("Amount is required", "Validation Error")
      return false
    }

    const amount = Number(editForm.amount)
    if (isNaN(amount) || amount <= 0) {
      Toast.error("Please enter a valid amount greater than 0", "Validation Error")
      return false
    }

    if (editForm.due_date < editForm.loan_date) {
      Toast.error("Due date cannot be before loan date", "Validation Error")
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

      Toast.success("Debt updated successfully", "Success")
      setEditModalVisible(false)
      loadDebt()
    } catch (error) {
      console.error("Error updating debt:", error)
      Toast.error("Failed to update debt. Please try again.", "Error")
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
    return debt?.debt_type === "OWING" ? "Owes you" : "You owe"
  }

  const getTypeColor = () => {
    return debt?.debt_type === "OWING" ? colors.status.success : colors.status.destructive
  }

  if (loading || !debt) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <Loader />
        <Text style={[styles.loadingText, { color: colors.foreground.primary }]}>Loading debt details...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <PageHeader title="Debt Details" textPosition="center" textAlign="left" />

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
                  {debt.status.toLowerCase()}
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
                    <Text style={[styles.contactBtnText, { color: colors.status.success }]}>Call</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSMS}
                    style={[styles.contactBtn, { backgroundColor: colors.primary.default + "20" }]}
                  >
                    <Feather name="message-square" size={16} color={colors.primary.default} />
                    <Text style={[styles.contactBtnText, { color: colors.primary.default }]}>SMS</Text>
                  </Pressable>
                </>
              )}

              {debt.contact_email && (
                <Pressable
                  onPress={handleEmail}
                  style={[styles.contactBtn, { backgroundColor: colors.status.warning + "20" }]}
                >
                  <Feather name="mail" size={16} color={colors.status.warning} />
                  <Text style={[styles.contactBtnText, { color: colors.status.warning }]}>Email</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Details Card */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary.default }]}>Debt Information</Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Due Date</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.due_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Loan Date</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.loan_date)}</Text>
            </View>

            {debt.contact_phone && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Phone Number</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.contact_phone}</Text>
              </View>
            )}

            {debt.contact_email && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Email</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.contact_email}</Text>
              </View>
            )}

            {debt.description && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Description</Text>
                <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{debt.description}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted.foreground }]}>Created On</Text>
              <Text style={[styles.detailValue, { color: colors.foreground.primary }]}>{formatDate(debt.created_at)}</Text>
            </View>
          </View>

          {/* Status Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary.default, marginBottom: 8 }]}>Status Actions</Text>

            {debt.status !== "PAID" && (
              <Pressable
                onPress={() => handleStatusChange("PAID")}
                style={[styles.actionBtn, { backgroundColor: colors.status.success }]}
              >
                <Feather name="check-circle" size={20} color={colors.status.successForeground} />
                <Text style={[styles.actionBtnText, { color: colors.status.successForeground }]}>Mark as Paid</Text>
              </Pressable>
            )}

            {debt.status !== "OVERDUE" && debt.status !== "PAID" && (
              <Pressable
                onPress={() => handleStatusChange("OVERDUE")}
                style={[styles.actionBtn, { backgroundColor: colors.status.warning }]}
              >
                <Feather name="alert-triangle" size={20} color={colors.status.warningForeground} />
                <Text style={[styles.actionBtnText, { color: colors.status.warningForeground }]}>Mark as Overdue</Text>
              </Pressable>
            )}

            {debt.status === "OVERDUE" && (
              <Pressable
                onPress={() => handleStatusChange("PENDING")}
                style={[styles.actionBtn, { backgroundColor: colors.primary.default }]}
              >
                <Feather name="clock" size={20} color={colors.primary.foreground} />
                <Text style={[styles.actionBtnText, { color: colors.primary.foreground }]}>Mark as Pending</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setEditModalVisible(true)}
              style={[styles.actionBtn, { backgroundColor: colors.primary.default }]}
            >
              <Feather name="edit" size={20} color={colors.primary.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.primary.foreground }]}>Edit Debt</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={[styles.actionBtn, { backgroundColor: colors.status.destructive }]}
            >
              <Feather name="trash-2" size={20} color={colors.status.destructiveForeground} />
              <Text style={[styles.actionBtnText, { color: colors.status.destructiveForeground }]}>Delete Debt</Text>
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
            <Text style={[styles.modalTitle, { color: colors.header.foreground }]}>Edit Debt</Text>
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
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>Debt Type</Text>

                  <View style={[styles.toggleRow, { borderColor: colors.primary.default }]}>
                    <View
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: editForm.debt_type === "OWING" ? colors.primary.default + "40" : colors.muted.default + "20" },
                      ]}
                    >
                      <Text style={{ color: editForm.debt_type === "OWING" ? colors.primary.default : colors.muted.foreground, fontWeight: "500" }}>
                        Someone owes me
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: editForm.debt_type === "OWED" ? colors.primary.default + "40" : colors.muted.default + "20" },
                      ]}
                    >
                      <Text style={{ color: editForm.debt_type === "OWED" ? colors.primary.default : colors.muted.foreground, fontWeight: "500" }}>
                        I owe someone
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.descBox, { backgroundColor: colors.muted.default + "40" }]}>
                    <Text style={[styles.descText, { color: colors.muted.foreground }]}>
                      {editForm.debt_type === "OWING"
                        ? "Record money that someone owes you - track when you lent money and when it should be repaid."
                        : "Record money that you owe to someone - keep track of your borrowing obligations and due dates."}
                    </Text>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>Contact Information</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.muted.foreground }]}>
                    Add the person's details for easy identification and contact.
                  </Text>

                  <TextInput
                    label="Full Name"
                    required
                    placeholder="John Doe"
                    value={editForm.contact_name}
                    onChangeText={(text) => handleEditChange("contact_name", text)}
                    icon="user"
                  />

                  <TextInput
                    label="Phone Number"
                    placeholder="6XX XXX XXX"
                    value={editForm.contact_phone}
                    onChangeText={(text) => handleEditChange("contact_phone", text)}
                    keyboardType="phone-pad"
                    icon="phone"
                    required
                  />

                  <TextInput
                    label="Email (Optional)"
                    placeholder="xxx@xxx.xx"
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
                  <Text style={[styles.cardTitle, { color: colors.primary.default }]}>Financial Details</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.muted.foreground }]}>
                    Specify the amount, currency and important dates for this debt.
                  </Text>

                  <TextInput
                    label="Amount"
                    required
                    placeholder="Eg: 50000"
                    value={editForm.amount}
                    onChangeText={(text) => handleEditChange("amount", text)}
                    keyboardType="numeric"
                    icon="credit-card"
                  />

                  <SelectInput
                    label="Currency"
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
                    label="Loan Date"
                    value={editForm.loan_date}
                    onChange={handleEditDateChange("loan_date")}
                    maximumDate={new Date()}
                    required
                  />

                  <DateInput
                    label="Due Date"
                    value={editForm.due_date}
                    onChange={handleEditDateChange("due_date")}
                    minimumDate={editForm.loan_date}
                    required
                  />

                  <TextInput
                    label="Description (Optional)"
                    placeholder="Eg: Car repair loan, business investment, etc."
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
                    {editLoading ? "Saving..." : "Save Changes"}
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
  content: { paddingHorizontal: 24 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cardHeaderInfo: { flex: 1 },
  contactName: { fontSize: 24, fontWeight: "700" },
  debtAmount: { fontSize: 20, fontWeight: "600", marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { textTransform: "capitalize", fontSize: 14, fontWeight: "500" },
  contactActions: { flexDirection: "row", gap: 8, marginTop: 16 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  contactBtnText: { marginLeft: 8, fontWeight: "500" },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  detailRow: { marginBottom: 24 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 18, marginTop: 4 },
  actionsSection: { marginTop: 32, gap: 12 },
  actionBtn: { padding: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  actionBtnText: { marginLeft: 8, fontWeight: "600", fontSize: 18 },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  formGroup: { marginTop: 32, gap: 16 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  cardSubtitle: { fontSize: 14, marginBottom: 16 },
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
  submitBtnText: { textAlign: "center", fontWeight: "600", fontSize: 18 },
})
