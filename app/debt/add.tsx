import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { createDebt, getContacts, SavedContact } from "@/services/debtServices"
import { scheduleAllDebtReminders } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import * as Contacts from "expo-contacts"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function AddDebt() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    amount: "",
    currency: "XAF",
    description: "",
    loan_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    debt_type: "OWING",
    interest_type: "none" as "none" | "flat" | "monthly",
    interest_rate: "",
  })
  const [loading, setLoading] = useState(false)
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([])
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [contactSearch, setContactSearch] = useState("")
  const [showPhoneBookPicker, setShowPhoneBookPicker] = useState(false)
  const [phoneBookSearch, setPhoneBookSearch] = useState("")
  const [phoneBookContacts, setPhoneBookContacts] = useState<Contacts.Contact[]>([])
  const [phoneBookLoading, setPhoneBookLoading] = useState(false)
  const [pendingContact, setPendingContact] = useState<Contacts.Contact | null>(null)
  const [showPhoneSelect, setShowPhoneSelect] = useState(false)

  const chipsTranslateY = useRef(new Animated.Value(-10)).current
  const chipsOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (user?.user_id) {
      getContacts(user.user_id).then(contacts => {
        setSavedContacts(contacts)
        if (contacts.length > 0) {
          Animated.parallel([
            Animated.spring(chipsTranslateY, { toValue: 0, damping: 18, stiffness: 220, useNativeDriver: true }),
            Animated.timing(chipsOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start()
        }
      })
    }
  }, [])

  const contactPhoneRef = useRef<TextInput>(null)
  const contactEmailRef = useRef<TextInput>(null)
  const amountRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const applyContact = (contact: SavedContact) => {
    setForm(prev => ({
      ...prev,
      contact_name: contact.contact_name,
      contact_phone: contact.contact_phone,
      contact_email: contact.contact_email || "",
    }))
    setShowContactPicker(false)
    setContactSearch("")
  }

  const pickFromPhoneBook = async () => {
    setPhoneBookLoading(true)
    setShowPhoneBookPicker(true)
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status !== "granted") {
        setShowPhoneBookPicker(false)
        Toast.error(t("debt.add.phoneBook.permissionDenied"))
        return
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      })
      const withPhone = data
        .filter(c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      setPhoneBookContacts(withPhone)
    } catch {
      Toast.error(t("debt.add.phoneBook.error"))
      setShowPhoneBookPicker(false)
    } finally {
      setPhoneBookLoading(false)
    }
  }

  const applyPhoneBookContact = (contact: Contacts.Contact) => {
    if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) return
    const seen = new Set<string>()
    const uniquePhones = contact.phoneNumbers.filter(p => {
      const norm = (p.number || "").replace(/[\s\-().+]/g, "")
      if (!norm || seen.has(norm)) return false
      seen.add(norm)
      return true
    })
    if (uniquePhones.length === 1) {
      setForm(prev => ({
        ...prev,
        contact_name: contact.name || "",
        contact_phone: uniquePhones[0].number || "",
        contact_email: contact.emails?.[0]?.email || prev.contact_email,
      }))
      setShowPhoneBookPicker(false)
      setPhoneBookSearch("")
    } else {
      setPendingContact({ ...contact, phoneNumbers: uniquePhones })
      setShowPhoneSelect(true)
    }
  }

  const applyPhoneNumber = (number: string) => {
    if (!pendingContact) return
    setForm(prev => ({
      ...prev,
      contact_name: pendingContact.name || "",
      contact_phone: number,
      contact_email: pendingContact.emails?.[0]?.email || prev.contact_email,
    }))
    setShowPhoneSelect(false)
    setShowPhoneBookPicker(false)
    setPhoneBookSearch("")
    setPendingContact(null)
  }

  const handleDateChange = (field: "loan_date" | "due_date") => (date: Date) =>
    setForm(prev => ({ ...prev, [field]: date }))

  const validateStep1 = () => {
    if (!form.contact_name.trim()) { Toast.error(t("debt.add.validation.nameRequired")); return false }
    if (!form.contact_phone.trim()) { Toast.error(t("debt.add.validation.phoneRequired")); return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      Toast.error(t("debt.add.validation.invalidAmount")); return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (form.due_date < form.loan_date) { Toast.error(t("debt.add.validation.invalidDueDate")); return }
    setLoading(true)
    try {
      await createDebt({
        user_id: user!.user_id,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description.trim() || undefined,
        loan_date: form.loan_date.toISOString(),
        due_date: form.due_date.toISOString(),
        debt_type: form.debt_type as "OWING" | "OWED",
        status: "PENDING",
        interest_type: form.interest_type,
        interest_rate: form.interest_type !== "none" ? Number(form.interest_rate) || 0 : 0,
      })
      Toast.success(t("debt.add.success"))
      scheduleAllDebtReminders(user!.user_id)
      router.back()
    } catch {
      Toast.error(t("debt.add.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return
      const normalized = form.contact_phone.replace(/[\s\-().]/g, "")
      const conflict = savedContacts.find(c =>
        c.contact_phone.replace(/[\s\-().]/g, "") === normalized &&
        c.contact_name.toLowerCase().trim() !== form.contact_name.toLowerCase().trim()
      )
      if (conflict) {
        Toast.confirm(
          t("debt.add.validation.phoneConflict", { name: conflict.contact_name }),
          () => setStep(s => s + 1),
          { title: t("debt.add.validation.phoneConflictTitle"), confirmText: t("common.continue"), cancelText: t("common.cancel") }
        )
        return
      }
    }
    if (step === 2 && !validateStep2()) return
    if (step < 3) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
    else router.back()
  }

  const STEPS = [
    { title: t("debt.add.steps.who"), subtitle: t("debt.add.steps.whoSub") },
    { title: t("debt.add.steps.amount"), subtitle: t("debt.add.steps.amountSub") },
    { title: t("debt.add.steps.when"), subtitle: t("debt.add.steps.whenSub") },
  ]

  return (
    <View style={[styles.root, { backgroundColor: colors.primary.default }]}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.primary.foreground} />
        </Pressable>
        <Text style={[styles.heroTitle, { color: colors.primary.foreground }]}>{STEPS[step - 1].title}</Text>
        <Text style={[styles.heroSubtitle, { color: colors.primary.foreground + "B3" }]}>{STEPS[step - 1].subtitle}</Text>
        <View style={styles.stepDots}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.stepDot, {
              backgroundColor: step >= i ? colors.primary.foreground : colors.primary.foreground + "4D",
              width: step === i ? 24 : 8,
            }]} />
          ))}
        </View>
      </View>

      {/* Sheet */}
      <KeyboardAwareScrollView
        style={[styles.sheet, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHandle} />

        {/* STEP 1 — Qui */}
        {step === 1 && (
          <>
            {savedContacts.length > 0 && (
              <Animated.View style={{ opacity: chipsOpacity, transform: [{ translateY: chipsTranslateY }], marginBottom: 20 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted.foreground, marginBottom: 4 }]}>
                  {t("debt.add.savedContacts.recent")}
                </Text>
                <Text style={[styles.contactsHint, { color: colors.muted.foreground }]}>
                  {form.contact_name && savedContacts.some(c => c.contact_name === form.contact_name && c.contact_phone === form.contact_phone)
                    ? t("debt.add.savedContacts.autoFilled", { name: form.contact_name.split(" ")[0] })
                    : t("debt.add.savedContacts.hint")}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {savedContacts.slice(0, 5).map((contact, i) => {
                    const initials = contact.contact_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                    const firstName = contact.contact_name.split(" ")[0]
                    const color = CHIP_COLORS[i % CHIP_COLORS.length]
                    const selected = form.contact_name === contact.contact_name && form.contact_phone === contact.contact_phone
                    return (
                      <Pressable key={i} onPress={() => applyContact(contact)} style={styles.chip}>
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

            <Field label={t("debt.add.debtType.title")} colors={colors}>
              <View style={[styles.toggle, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {(["OWING", "OWED"] as const).map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => handleChange("debt_type", opt)}
                    style={[styles.toggleOpt, { backgroundColor: form.debt_type === opt ? colors.primary.default : "transparent" }]}
                  >
                    <Text style={{ color: form.debt_type === opt ? colors.primary.foreground : colors.foreground.primary, fontWeight: "600", fontSize: 13 }}>
                      {opt === "OWING" ? t("debt.add.debtType.owing") : t("debt.add.debtType.owed")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Pressable onPress={pickFromPhoneBook} style={[styles.phoneBookBtn, { borderColor: colors.border, backgroundColor: colors.card.background }]}>
              <Feather name="book-open" size={14} color={colors.primary.default} />
              <Text style={[styles.phoneBookBtnText, { color: colors.primary.default }]}>
                {t("debt.add.phoneBook.button")}
              </Text>
            </Pressable>

            <Field label={t("debt.add.name")} required colors={colors}>
              <InputRow icon="user" colors={colors}>
                <TextInput
                  style={[styles.inputText, { color: colors.foreground.primary }]}
                  placeholder={t("debt.add.namePlaceholder")}
                  placeholderTextColor={colors.muted.foreground}
                  value={form.contact_name}
                  onChangeText={v => handleChange("contact_name", v)}
                  returnKeyType="next"
                  onSubmitEditing={() => contactPhoneRef.current?.focus()}
                />
              </InputRow>
            </Field>

            <Field label={t("debt.add.contact.phone")} required colors={colors}>
              <InputRow icon="phone" colors={colors}>
                <TextInput
                  ref={contactPhoneRef}
                  style={[styles.inputText, { color: colors.foreground.primary }]}
                  placeholder="+XXX XXX XXX"
                  placeholderTextColor={colors.muted.foreground}
                  value={form.contact_phone}
                  onChangeText={v => handleChange("contact_phone", v)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => contactEmailRef.current?.focus()}
                />
              </InputRow>
            </Field>

            <Field label={t("debt.add.contact.email")} optional colors={colors}>
              <InputRow icon="mail" colors={colors}>
                <TextInput
                  ref={contactEmailRef}
                  style={[styles.inputText, { color: colors.foreground.primary }]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.muted.foreground}
                  value={form.contact_email}
                  onChangeText={v => handleChange("contact_email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
              </InputRow>
            </Field>
          </>
        )}

        {/* STEP 2 — Combien */}
        {step === 2 && (
          <>
            <Field label={t("debt.add.amount")} required colors={colors}>
              <InputRow icon="credit-card" colors={colors}>
                <TextInput
                  ref={amountRef}
                  style={[styles.inputText, { color: colors.foreground.primary }]}
                  placeholder="0"
                  placeholderTextColor={colors.muted.foreground}
                  value={form.amount}
                  onChangeText={v => handleChange("amount", v)}
                  keyboardType="numeric"
                  returnKeyType="done"
                  autoFocus
                />
              </InputRow>
            </Field>

            <Field label={t("debt.add.financial.currency")} colors={colors}>
              <SelectInput
                value={form.currency}
                onChange={v => handleChange("currency", v)}
                options={[
                  { label: "XAF — Franc CFA", value: "XAF" },
                  { label: "USD — US Dollar", value: "USD" },
                  { label: "EUR — Euro", value: "EUR" },
                  { label: "GBP — British Pound", value: "GBP" },
                ]}
              />
            </Field>

            <Field label={t("debt.interest.title")} colors={colors}>
              <SelectInput
                value={form.interest_type}
                onChange={v => handleChange("interest_type", v)}
                options={[
                  { label: t("debt.interest.none"), value: "none" },
                  { label: t("debt.interest.flat"), value: "flat" },
                  { label: t("debt.interest.monthly"), value: "monthly" },
                ]}
              />
            </Field>

            {form.interest_type !== "none" && (
              <Field label={t("debt.interest.rate")} colors={colors}>
                <InputRow icon="percent" colors={colors}>
                  <TextInput
                    style={[styles.inputText, { color: colors.foreground.primary }]}
                    placeholder="0"
                    placeholderTextColor={colors.muted.foreground}
                    value={form.interest_rate}
                    onChangeText={v => handleChange("interest_rate", v)}
                    keyboardType="numeric"
                  />
                </InputRow>
              </Field>
            )}
          </>
        )}

        {/* STEP 3 — Quand */}
        {step === 3 && (
          <>
            <Field label={t("debt.add.financial.loanDate")} required colors={colors}>
              <DateInput value={form.loan_date} onChange={handleDateChange("loan_date")} maximumDate={new Date()} />
            </Field>

            <Field label={t("debt.add.financial.dueDate")} required colors={colors}>
              <DateInput value={form.due_date} onChange={handleDateChange("due_date")} minimumDate={form.loan_date} />
            </Field>

            <Field label={t("debt.add.description")} optional colors={colors}>
              <InputRow icon="file-text" colors={colors} alignTop>
                <TextInput
                  ref={descriptionRef}
                  style={[styles.inputText, styles.textarea, { color: colors.foreground.primary }]}
                  placeholder={t("debt.add.descriptionPlaceholder")}
                  placeholderTextColor={colors.muted.foreground}
                  value={form.description}
                  onChangeText={v => handleChange("description", v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </InputRow>
            </Field>
          </>
        )}

        {/* Button */}
        <Pressable
          onPress={handleNext}
          disabled={loading}
          style={[styles.nextBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1, marginTop: 8 }]}
        >
          {loading ? <Loader color={colors.primary.foreground} /> : null}
          <Text style={[styles.nextBtnText, { color: colors.primary.foreground }]}>
            {step === 3 ? t("debt.add.save") : t("common.continue")}
          </Text>
          {!loading && <Feather name={step === 3 ? "check" : "arrow-right"} size={18} color={colors.primary.foreground} />}
        </Pressable>
      </KeyboardAwareScrollView>

      {/* Phone Book Picker Modal */}
      <Modal
        visible={showPhoneBookPicker}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowPhoneBookPicker(false); setPhoneBookSearch(""); setPhoneBookLoading(false) }}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.background.primary }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerTitle, { color: colors.foreground.primary }]}>
                {t("debt.add.phoneBook.title")}
              </Text>
              <Pressable onPress={() => { setShowPhoneBookPicker(false); setPhoneBookSearch(""); setPhoneBookLoading(false) }}>
                <Feather name="x" size={20} color={colors.foreground.primary} />
              </Pressable>
            </View>

            {phoneBookLoading ? (
              <View style={styles.pickerCenter}>
                <Loader color={colors.primary.default} />
                <Text style={[styles.pickerEmptyText, { color: colors.muted.foreground, marginTop: 12 }]}>
                  {t("debt.add.phoneBook.loading")}
                </Text>
              </View>
            ) : phoneBookContacts.length === 0 ? (
              <View style={styles.pickerCenter}>
                <Feather name="users" size={32} color={colors.muted.foreground} />
                <Text style={[styles.pickerEmptyText, { color: colors.muted.foreground, marginTop: 10 }]}>
                  {t("debt.add.phoneBook.empty")}
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.pickerSearch, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                  <Feather name="search" size={14} color={colors.muted.foreground} />
                  <TextInput
                    style={[styles.pickerSearchInput, { color: colors.foreground.primary }]}
                    placeholder={t("debt.add.phoneBook.search")}
                    placeholderTextColor={colors.muted.foreground}
                    value={phoneBookSearch}
                    onChangeText={setPhoneBookSearch}
                    autoFocus
                  />
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {phoneBookContacts
                    .filter(c =>
                      !phoneBookSearch ||
                      (c.name || "").toLowerCase().includes(phoneBookSearch.toLowerCase()) ||
                      c.phoneNumbers?.some(p => (p.number || "").includes(phoneBookSearch))
                    )
                    .map((contact, i) => {
                      const initials = (contact.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                      const seen = new Set<string>()
                      const uniquePhones = (contact.phoneNumbers || []).filter(p => {
                        const norm = (p.number || "").replace(/[\s\-().+]/g, "")
                        if (!norm || seen.has(norm)) return false
                        seen.add(norm); return true
                      })
                      return (
                        <Pressable
                          key={i}
                          onPress={() => applyPhoneBookContact(contact)}
                          style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                        >
                          <View style={[styles.pickerAvatar, { backgroundColor: colors.primary.default + "20" }]}>
                            <Text style={[styles.pickerAvatarText, { color: colors.primary.default }]}>{initials}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.pickerName, { color: colors.foreground.primary }]}>{contact.name}</Text>
                            {uniquePhones.length === 1 ? (
                              <Text style={[styles.pickerPhone, { color: colors.muted.foreground }]}>
                                {uniquePhones[0].number}
                              </Text>
                            ) : (
                              <Text style={[styles.pickerPhone, { color: colors.primary.default }]}>
                                {uniquePhones.length} numéros
                              </Text>
                            )}
                          </View>
                          <Feather name="chevron-right" size={16} color={colors.muted.foreground} />
                        </Pressable>
                      )
                    })
                  }
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Phone Number Selection Modal */}
      <Modal
        visible={showPhoneSelect}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPhoneSelect(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.phoneSelectSheet, { backgroundColor: colors.background.primary }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.pickerTitle, { color: colors.foreground.primary }]}>
                  {t("debt.add.phoneBook.selectPhone")}
                </Text>
                {pendingContact?.name && (
                  <Text style={[styles.pickerPhone, { color: colors.muted.foreground, marginTop: 2 }]}>
                    {pendingContact.name}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => setShowPhoneSelect(false)}>
                <Feather name="x" size={20} color={colors.foreground.primary} />
              </Pressable>
            </View>
            {pendingContact?.phoneNumbers?.map((p, i) => (
              <Pressable
                key={i}
                onPress={() => applyPhoneNumber(p.number || "")}
                style={[styles.phoneSelectItem, { borderBottomColor: colors.border }]}
              >
                <Feather name="phone" size={16} color={colors.primary.default} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerName, { color: colors.foreground.primary }]}>{p.number}</Text>
                  {p.label && (
                    <Text style={[styles.pickerPhone, { color: colors.muted.foreground }]}>{p.label}</Text>
                  )}
                </View>
                <Feather name="chevron-right" size={16} color={colors.muted.foreground} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactPicker}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowContactPicker(false); setContactSearch("") }}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.background.primary }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerTitle, { color: colors.foreground.primary }]}>
                {t("debt.add.savedContacts.title")}
              </Text>
              <Pressable onPress={() => { setShowContactPicker(false); setContactSearch("") }}>
                <Feather name="x" size={20} color={colors.foreground.primary} />
              </Pressable>
            </View>
            <View style={[styles.pickerSearch, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="search" size={14} color={colors.muted.foreground} />
              <TextInput
                style={[styles.pickerSearchInput, { color: colors.foreground.primary }]}
                placeholder={t("debt.add.savedContacts.search")}
                placeholderTextColor={colors.muted.foreground}
                value={contactSearch}
                onChangeText={setContactSearch}
                autoFocus
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {savedContacts
                .filter(c =>
                  !contactSearch ||
                  c.contact_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.contact_phone.includes(contactSearch)
                )
                .map((contact, i) => {
                  const initials = contact.contact_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                  return (
                    <Pressable
                      key={i}
                      onPress={() => applyContact(contact)}
                      style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                    >
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
                })
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function Field({ label, required, optional, colors, children }: {
  label: string; required?: boolean; optional?: boolean; colors: any; children: React.ReactNode
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.muted.foreground }]}>
        {label}
        {required && <Text style={{ color: colors.status.destructive }}> *</Text>}
        {optional && <Text style={{ color: colors.muted.foreground }}> (opt.)</Text>}
      </Text>
      {children}
    </View>
  )
}

function InputRow({ icon, colors, alignTop, children }: {
  icon: string; colors: any; alignTop?: boolean; children: React.ReactNode
}) {
  return (
    <View style={[styles.inputRow, {
      backgroundColor: colors.card.background,
      borderColor: colors.border,
      alignItems: alignTop ? "flex-start" : "center",
    }]}>
      <Feather name={icon as any} size={16} color={colors.muted.foreground} style={alignTop ? { marginTop: 2 } : undefined} />
      {children}
    </View>
  )
}

const CHIP_COLORS = ["#6C63FF", "#FF6B6B", "#4ECDC4", "#F7B731", "#45B7D1"]

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: "700" },
  heroSubtitle: { fontSize: 13, marginTop: 4 },
  stepDots: { flexDirection: "row", gap: 6, marginTop: 16 },
  stepDot: { height: 6, borderRadius: 999 },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(128,128,128,0.3)", alignSelf: "center", marginBottom: 24 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputText: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 72 },
  toggle: { flexDirection: "row", borderWidth: 1, borderRadius: 10, padding: 3, gap: 4 },
  toggleOpt: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8 },
  nextBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 14,
  },
  nextBtnText: { fontWeight: "600", fontSize: 16 },
  contactsHint: { fontSize: 11, marginBottom: 10 },
  chipsRow: { gap: 10, paddingRight: 4 },
  chip: { alignItems: "center", gap: 5, width: 52 },
  chipAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  chipInitials: { fontSize: 15, fontWeight: "700" },
  chipName: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  phoneBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  phoneBookBtnText: { fontSize: 13, fontWeight: "600" },
  pickerCenter: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  pickerEmptyText: { fontSize: 13, textAlign: "center" },
  phoneSelectSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  phoneSelectItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", paddingBottom: 32 },
  pickerHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  pickerTitle: { fontSize: 16, fontWeight: "700" },
  pickerSearch: {
    flexDirection: "row", alignItems: "center", gap: 8,
    margin: 16, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
  },
  pickerSearchInput: { flex: 1, fontSize: 14 },
  pickerItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  pickerAvatarText: { fontSize: 14, fontWeight: "700" },
  pickerName: { fontSize: 14, fontWeight: "600" },
  pickerPhone: { fontSize: 12, marginTop: 1 },
})
