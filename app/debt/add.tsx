import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { createDebt } from "@/services/debtServices"
import { scheduleAllDebtReminders } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
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
  })
  const [loading, setLoading] = useState(false)

  const contactPhoneRef = useRef<TextInput>(null)
  const contactEmailRef = useRef<TextInput>(null)
  const amountRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

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
    if (step === 1 && !validateStep1()) return
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
          <Feather name="chevron-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.heroTitle}>{STEPS[step - 1].title}</Text>
        <Text style={styles.heroSubtitle}>{STEPS[step - 1].subtitle}</Text>
        <View style={styles.stepDots}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.stepDot, {
              backgroundColor: step >= i ? "#fff" : "rgba(255,255,255,0.3)",
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
            <Field label={t("debt.add.debtType.title")} colors={colors}>
              <View style={[styles.toggle, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                {(["OWING", "OWED"] as const).map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => handleChange("debt_type", opt)}
                    style={[styles.toggleOpt, { backgroundColor: form.debt_type === opt ? colors.primary.default : "transparent" }]}
                  >
                    <Text style={{ color: form.debt_type === opt ? "#fff" : colors.foreground.primary, fontWeight: "600", fontSize: 13 }}>
                      {opt === "OWING" ? t("debt.add.debtType.owing") : t("debt.add.debtType.owed")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>

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
          {loading ? <Loader /> : null}
          <Text style={styles.nextBtnText}>
            {step === 3 ? t("debt.add.save") : t("common.continue")}
          </Text>
          {!loading && <Feather name={step === 3 ? "check" : "arrow-right"} size={18} color="#fff" />}
        </Pressable>
      </KeyboardAwareScrollView>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: "700", color: "#fff" },
  heroSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
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
  nextBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
})
