import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteDebt, getContacts, getDebtById, SavedContact, updateDebt } from "@/services/debtServices"
import { scheduleAllDebtReminders } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DebtDetails() {
  const { id } = useLocalSearchParams()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [debt, setDebt] = useState<Debt | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    contact_name: "", contact_phone: "", contact_email: "",
    amount: "", currency: "XAF", description: "",
    loan_date: new Date(), due_date: new Date(),
    debt_type: "OWING" as "OWING" | "OWED",
  })
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([])
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [contactSearch, setContactSearch] = useState("")
  const chipsTranslateY = useRef(new Animated.Value(-10)).current
  const chipsOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (user?.user_id) {
      loadDebt()
      getContacts(user.user_id).then(contacts => {
        setSavedContacts(contacts)
        if (contacts.length > 0) {
          Animated.parallel([
            Animated.spring(chipsTranslateY, { toValue: 0, damping: 18, stiffness: 220, useNativeDriver: true }),
            Animated.timing(chipsOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start()
        }
      })
    } else router.replace("/auth/login")
  }, [id, user])

  const loadDebt = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getDebtById(id as string)
      if (data && data.user_id === user.user_id) {
        setDebt(data)
        setEditForm({
          contact_name: data.contact_name,
          contact_phone: data.contact_phone || "",
          contact_email: data.contact_email || "",
          amount: data.amount.toString(),
          currency: data.currency || "XAF",
          description: data.description || "",
          loan_date: new Date(data.loan_date),
          due_date: new Date(data.due_date),
          debt_type: data.debt_type,
        })
      } else {
        Toast.error(t("debt.details.notFound")); router.back()
      }
    } catch {
      Toast.error(t("debt.details.failedToLoad")); router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: DebtStatus) => {
    try {
      await updateDebt(debt!.debt_id, { status })
      loadDebt()
      scheduleAllDebtReminders(user!.user_id)
      Toast.success(t("debt.details.statusUpdated"))
    } catch { Toast.error(t("debt.details.statusUpdateFailed")) }
  }

  const handleDelete = () => {
    Toast.confirm(t("debt.delete.confirmMessage"), async () => {
      try {
        await deleteDebt(debt!.debt_id, user!.user_id)
        Toast.success(t("debt.details.deleteSuccess")); router.back()
      } catch { Toast.error(t("debt.details.deleteFailed")) }
    }, { title: t("debt.delete.title"), confirmText: t("debt.delete.confirm"), cancelText: t("debt.delete.cancel") })
  }

  const handleCall = () => debt?.contact_phone && Linking.openURL(`tel:${debt.contact_phone}`)
  const handleSMS = () => {
    if (!debt?.contact_phone) return
    const amount = formatCurrency(debt.amount, debt.currency || "XAF")
    const p = { name: debt.contact_name, amount, loanDate: formatDate(debt.loan_date), dueDate: formatDate(debt.due_date) }
    const msg = debt.debt_type === "OWING" ? t("debt.details.messages.smsOwing", p) : t("debt.details.messages.smsOwed", p)
    Linking.openURL(`sms:${debt.contact_phone}?body=${encodeURIComponent(msg)}`)
  }
  const handleEmail = () => {
    if (!debt?.contact_email) return
    const amount = formatCurrency(debt.amount, debt.currency || "XAF")
    const p = { name: debt.contact_name, amount, loanDate: formatDate(debt.loan_date), dueDate: formatDate(debt.due_date) }
    const subject = debt.debt_type === "OWING" ? t("debt.details.messages.emailSubjectOwing", p) : t("debt.details.messages.emailSubjectOwed", p)
    const body = debt.debt_type === "OWING" ? t("debt.details.messages.emailBodyOwing", p) : t("debt.details.messages.emailBodyOwed", p)
    Linking.openURL(`mailto:${debt.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleEditChange = (field: string, value: string) => setEditForm(prev => ({ ...prev, [field]: value }))

  const applyEditContact = (contact: SavedContact) => {
    setEditForm(prev => ({
      ...prev,
      contact_name: contact.contact_name,
      contact_phone: contact.contact_phone,
      contact_email: contact.contact_email || "",
    }))
    setShowContactPicker(false)
    setContactSearch("")
  }
  const handleEditDateChange = (field: "loan_date" | "due_date") => (date: Date) => setEditForm(prev => ({ ...prev, [field]: date }))

  const validateEditForm = () => {
    if (!editForm.contact_name.trim()) { Toast.error(t("debt.add.validation.nameRequired")); return false }
    if (!editForm.contact_phone.trim()) { Toast.error(t("debt.add.validation.phoneRequired")); return false }
    if (!editForm.amount.trim() || isNaN(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      Toast.error(t("debt.add.validation.invalidAmount")); return false
    }
    if (editForm.due_date < editForm.loan_date) { Toast.error(t("debt.add.validation.invalidDueDate")); return false }
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
      Toast.success(t("debt.details.updateSuccess"))
      setEditModalVisible(false)
      loadDebt()
      scheduleAllDebtReminders(user!.user_id)
    } catch { Toast.error(t("debt.details.updateFailed")) }
    finally { setEditLoading(false) }
  }

  const statusColor = debt?.status === "PAID" ? colors.status.success : debt?.status === "OVERDUE" ? colors.status.destructive : colors.status.warning
  const typeColor = debt?.debt_type === "OWING" ? colors.status.success : colors.status.destructive
  const initials = debt?.contact_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?"

  if (loading || !debt) {
    return (
      <View style={[styles.root, { backgroundColor: colors.primary.default, flex: 1, alignItems: "center", justifyContent: "center" }]}>
        <Loader />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary.default }]}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <View style={styles.heroTopRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.heroAvatar}>
          <Text style={styles.heroAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{debt.contact_name}</Text>
        <Text style={styles.heroAmount}>{formatCurrency(debt.amount, debt.currency || "XAF")}</Text>
        <Text style={[styles.heroType, { color: "rgba(255,255,255,0.8)" }]}>
          {debt.debt_type === "OWING" ? t("history.debtType.owesYou") : t("history.debtType.youOwe")}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColor + "30", borderColor: statusColor + "60" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: "#fff" }]}>
            {debt.status === "PAID" ? t("debt.status.paid") : debt.status === "OVERDUE" ? t("debt.status.overdue") : t("debt.status.pending")}
          </Text>
        </View>
      </View>

      {/* Sheet */}
      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHandle} />

        {/* Contact actions */}
        {(debt.contact_phone || debt.contact_email) && (
          <View style={styles.contactRow}>
            {debt.contact_phone && (
              <>
                <Pressable onPress={handleCall} style={[styles.contactBtn, { backgroundColor: colors.status.success + "18", borderColor: colors.status.success + "40" }]}>
                  <Feather name="phone" size={15} color={colors.status.success} />
                  <Text style={[styles.contactBtnText, { color: colors.status.success }]}>{t("debt.details.call")}</Text>
                </Pressable>
                <Pressable onPress={handleSMS} style={[styles.contactBtn, { backgroundColor: colors.primary.default + "18", borderColor: colors.primary.default + "40" }]}>
                  <Feather name="message-square" size={15} color={colors.primary.default} />
                  <Text style={[styles.contactBtnText, { color: colors.primary.default }]}>{t("debt.details.sms")}</Text>
                </Pressable>
              </>
            )}
            {debt.contact_email && (
              <Pressable onPress={handleEmail} style={[styles.contactBtn, { backgroundColor: colors.status.warning + "18", borderColor: colors.status.warning + "40" }]}>
                <Feather name="mail" size={15} color={colors.status.warning} />
                <Text style={[styles.contactBtnText, { color: colors.status.warning }]}>{t("debt.details.email")}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <InfoRow label={t("debt.details.dueDate")} value={formatDate(debt.due_date)} colors={colors} />
          <InfoRow label={t("debt.details.loanDate")} value={formatDate(debt.loan_date)} colors={colors} />
          {debt.contact_phone && <InfoRow label={t("debt.details.phoneNumber")} value={debt.contact_phone} colors={colors} />}
          {debt.contact_email && <InfoRow label={t("debt.details.email")} value={debt.contact_email} colors={colors} />}
          {debt.description && <InfoRow label={t("debt.details.description")} value={debt.description} colors={colors} />}
          <InfoRow label={t("debt.details.createdOn")} value={formatDate(debt.created_at)} colors={colors} last />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {debt.status !== "PAID" && (
            <Pressable onPress={() => handleStatusChange("PAID")} style={[styles.actionBtn, { backgroundColor: colors.status.success }]}>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>{t("debt.details.markAsPaid")}</Text>
            </Pressable>
          )}
          {debt.status === "PENDING" && (
            <Pressable onPress={() => handleStatusChange("OVERDUE")} style={[styles.actionBtn, { backgroundColor: colors.status.warning }]}>
              <Feather name="alert-triangle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>{t("debt.details.markAsOverdue")}</Text>
            </Pressable>
          )}
          {debt.status === "OVERDUE" && (
            <Pressable onPress={() => handleStatusChange("PENDING")} style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: colors.border }]}>
              <Feather name="clock" size={18} color={colors.foreground.primary} />
              <Text style={[styles.actionBtnText, { color: colors.foreground.primary }]}>{t("debt.details.markAsPending")}</Text>
            </Pressable>
          )}
          {debt.status !== "PAID" && (
            <Pressable onPress={() => setEditModalVisible(true)} style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: colors.border }]}>
              <Feather name="edit-2" size={18} color={colors.foreground.primary} />
              <Text style={[styles.actionBtnText, { color: colors.foreground.primary }]}>{t("debt.details.editDebt")}</Text>
            </Pressable>
          )}
          <Pressable onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: colors.status.destructive }]}>
            <Feather name="trash-2" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>{t("debt.details.deleteDebt")}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal animationType="slide" transparent={false} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={[styles.root, { backgroundColor: colors.primary.default }]}>
          {/* Modal hero */}
          <View style={[styles.modalHero, { paddingTop: insets.top + 8 }]}>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => setEditModalVisible(false)} style={styles.backBtn}>
                <Feather name="x" size={22} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.modalHeroTitle}>{t("debt.details.editTitle")}</Text>
            <Text style={styles.modalHeroSub}>{debt.contact_name}</Text>
          </View>

          {/* Modal form */}
          <KeyboardAwareScrollView
            style={[styles.sheet, { backgroundColor: colors.background.primary }]}
            contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}
            enableOnAndroid
            extraScrollHeight={80}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetHandle} />

            {savedContacts.length > 0 && (
              <Animated.View style={{ opacity: chipsOpacity, transform: [{ translateY: chipsTranslateY }], marginBottom: 20 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted.foreground, marginBottom: 4 }]}>
                  {t("debt.add.savedContacts.recent")}
                </Text>
                <Text style={[styles.contactsHint, { color: colors.muted.foreground }]}>
                  {editForm.contact_name && savedContacts.some(c => c.contact_name === editForm.contact_name && c.contact_phone === editForm.contact_phone)
                    ? t("debt.add.savedContacts.autoFilled", { name: editForm.contact_name.split(" ")[0] })
                    : t("debt.add.savedContacts.hint")}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {savedContacts.slice(0, 5).map((contact, i) => {
                    const initials = contact.contact_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                    const firstName = contact.contact_name.split(" ")[0]
                    const color = CHIP_COLORS[i % CHIP_COLORS.length]
                    const selected = editForm.contact_name === contact.contact_name && editForm.contact_phone === contact.contact_phone
                    return (
                      <Pressable key={i} onPress={() => applyEditContact(contact)} style={styles.chip}>
                        <View style={[styles.chipAvatar, { backgroundColor: selected ? color : color + "22" }]}>
                          <Text style={[styles.chipInitials, { color: selected ? "#fff" : color }]}>{initials}</Text>
                        </View>
                        <Text style={[styles.chipName, { color: selected ? colors.primary.default : colors.foreground.primary }]} numberOfLines={1}>
                          {firstName}
                        </Text>
                      </Pressable>
                    )
                  })}
                  {savedContacts.length > 5 && (
                    <Pressable onPress={() => setShowContactPicker(true)} style={styles.chip}>
                      <View style={[styles.chipAvatar, { backgroundColor: colors.border }]}>
                        <Text style={[styles.chipInitials, { color: colors.muted.foreground }]}>+{savedContacts.length - 5}</Text>
                      </View>
                      <Text style={[styles.chipName, { color: colors.muted.foreground }]}>{t("debt.add.savedContacts.more")}</Text>
                    </Pressable>
                  )}
                </ScrollView>
              </Animated.View>
            )}

            <EField label={t("debt.add.name")} required colors={colors}>
              <EInput icon="user" colors={colors}>
                <TextInput style={[styles.inputText, { color: colors.foreground.primary }]} placeholder={t("debt.add.namePlaceholder")} placeholderTextColor={colors.muted.foreground} value={editForm.contact_name} onChangeText={v => handleEditChange("contact_name", v)} />
              </EInput>
            </EField>

            <EField label={t("debt.add.contact.phone")} required colors={colors}>
              <EInput icon="phone" colors={colors}>
                <TextInput style={[styles.inputText, { color: colors.foreground.primary }]} placeholder="+XXX XXX XXX" placeholderTextColor={colors.muted.foreground} value={editForm.contact_phone} onChangeText={v => handleEditChange("contact_phone", v)} keyboardType="phone-pad" />
              </EInput>
            </EField>

            <EField label={t("debt.add.contact.email")} optional colors={colors}>
              <EInput icon="mail" colors={colors}>
                <TextInput style={[styles.inputText, { color: colors.foreground.primary }]} placeholder="email@example.com" placeholderTextColor={colors.muted.foreground} value={editForm.contact_email} onChangeText={v => handleEditChange("contact_email", v)} keyboardType="email-address" autoCapitalize="none" />
              </EInput>
            </EField>

            <EField label={t("debt.add.amount")} required colors={colors}>
              <EInput icon="credit-card" colors={colors}>
                <TextInput style={[styles.inputText, { color: colors.foreground.primary }]} placeholder="0" placeholderTextColor={colors.muted.foreground} value={editForm.amount} onChangeText={v => handleEditChange("amount", v)} keyboardType="numeric" />
              </EInput>
            </EField>

            <EField label={t("debt.add.financial.currency")} colors={colors}>
              <SelectInput value={editForm.currency} onChange={v => handleEditChange("currency", v)} options={[
                { label: "XAF — Franc CFA", value: "XAF" },
                { label: "USD — US Dollar", value: "USD" },
                { label: "EUR — Euro", value: "EUR" },
                { label: "GBP — British Pound", value: "GBP" },
              ]} />
            </EField>

            <EField label={t("debt.add.financial.loanDate")} required colors={colors}>
              <DateInput value={editForm.loan_date} onChange={handleEditDateChange("loan_date")} maximumDate={new Date()} />
            </EField>

            <EField label={t("debt.add.financial.dueDate")} required colors={colors}>
              <DateInput value={editForm.due_date} onChange={handleEditDateChange("due_date")} minimumDate={editForm.loan_date} />
            </EField>

            <EField label={t("debt.add.description")} optional colors={colors}>
              <EInput icon="file-text" colors={colors} alignTop>
                <TextInput style={[styles.inputText, styles.textarea, { color: colors.foreground.primary }]} placeholder={t("debt.add.descriptionPlaceholder")} placeholderTextColor={colors.muted.foreground} value={editForm.description} onChangeText={v => handleEditChange("description", v)} multiline numberOfLines={3} textAlignVertical="top" />
              </EInput>
            </EField>

            <Pressable onPress={handleEditSubmit} disabled={editLoading} style={[styles.saveBtn, { backgroundColor: colors.primary.default, opacity: editLoading ? 0.7 : 1 }]}>
              {editLoading ? <Loader /> : <Feather name="check" size={18} color="#fff" />}
              <Text style={styles.saveBtnText}>{editLoading ? t("debt.details.saving") : t("debt.details.saveChanges")}</Text>
            </Pressable>
          </KeyboardAwareScrollView>

          {/* Contact Picker */}
          <Modal visible={showContactPicker} animationType="slide" transparent onRequestClose={() => { setShowContactPicker(false); setContactSearch("") }}>
            <View style={styles.pickerOverlay}>
              <View style={[styles.pickerSheet, { backgroundColor: colors.background.primary }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.pickerTitle, { color: colors.foreground.primary }]}>{t("debt.add.savedContacts.title")}</Text>
                  <Pressable onPress={() => { setShowContactPicker(false); setContactSearch("") }}>
                    <Feather name="x" size={20} color={colors.foreground.primary} />
                  </Pressable>
                </View>
                <View style={[styles.pickerSearch, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  <Feather name="search" size={14} color={colors.muted.foreground} />
                  <TextInput style={[styles.pickerSearchInput, { color: colors.foreground.primary }]} placeholder={t("debt.add.savedContacts.search")} placeholderTextColor={colors.muted.foreground} value={contactSearch} onChangeText={setContactSearch} autoFocus />
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {savedContacts.filter(c => !contactSearch || c.contact_name.toLowerCase().includes(contactSearch.toLowerCase()) || c.contact_phone.includes(contactSearch)).map((contact, i) => {
                    const initials = contact.contact_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                    return (
                      <Pressable key={i} onPress={() => applyEditContact(contact)} style={[styles.pickerItem, { borderBottomColor: colors.border }]}>
                        <View style={[styles.pickerAvatar, { backgroundColor: colors.primary.default + "20" }]}>
                          <Text style={[styles.pickerAvatarText, { color: colors.primary.default }]}>{initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pickerName, { color: colors.foreground.primary }]}>{contact.contact_name}</Text>
                          <Text style={[styles.pickerPhone, { color: colors.muted.foreground }]}>{contact.contact_phone}</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={colors.muted.foreground} />
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>
    </View>
  )
}

function InfoRow({ label, value, colors, last }: { label: string; value: string; colors: any; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.muted.foreground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground.primary }]}>{value}</Text>
    </View>
  )
}

function EField({ label, required, optional, colors, children }: { label: string; required?: boolean; optional?: boolean; colors: any; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.muted.foreground }]}>
        {label}
        {required && <Text style={{ color: colors.status.destructive }}> *</Text>}
        {optional && <Text> (opt.)</Text>}
      </Text>
      {children}
    </View>
  )
}

function EInput({ icon, colors, alignTop, children }: { icon: string; colors: any; alignTop?: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border, alignItems: alignTop ? "flex-start" : "center" }]}>
      <Feather name={icon as any} size={16} color={colors.muted.foreground} style={alignTop ? { marginTop: 2 } : undefined} />
      {children}
    </View>
  )
}

const CHIP_COLORS = ["#6C63FF", "#FF6B6B", "#4ECDC4", "#F7B731", "#45B7D1"]

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 24, paddingBottom: 24, alignItems: "center" },
  heroTopRow: { width: "100%", marginBottom: 8 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  heroAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 10, marginTop: 8 },
  heroAvatarText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  heroName: { fontSize: 22, fontWeight: "700", color: "#fff", textAlign: "center" },
  heroAmount: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 2 },
  heroType: { fontSize: 13, marginTop: 2, marginBottom: 10 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(128,128,128,0.3)", alignSelf: "center", marginBottom: 20 },
  contactRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  contactBtnText: { fontSize: 13, fontWeight: "600" },
  infoCard: { borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  infoRow: { paddingHorizontal: 14, paddingVertical: 12 },
  infoLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 },
  infoValue: { fontSize: 14 },
  actions: { gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12 },
  actionBtnOutline: { backgroundColor: "transparent", borderWidth: 1 },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  modalHero: { paddingHorizontal: 24, paddingBottom: 20 },
  modalHeroTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 48 },
  modalHeroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  inputRow: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  inputText: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 72 },
  saveBtn: { flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 14, marginTop: 8 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  contactsHint: { fontSize: 11, marginBottom: 10 },
  chipsRow: { gap: 10, paddingRight: 4 },
  chip: { alignItems: "center", gap: 5, width: 52 },
  chipAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  chipInitials: { fontSize: 15, fontWeight: "700" },
  chipName: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  pickerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 32 },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 16, fontWeight: "700" },
  pickerSearch: { flexDirection: "row", alignItems: "center", gap: 8, margin: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  pickerSearchInput: { flex: 1, fontSize: 14 },
  pickerItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  pickerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  pickerAvatarText: { fontSize: 14, fontWeight: "700" },
  pickerName: { fontSize: 14, fontWeight: "600" },
  pickerPhone: { fontSize: 12, marginTop: 1 },
})
