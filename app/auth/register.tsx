import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Dimensions, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    pin: "",
    confirmPin: "",
  })
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsModalVisible, setTermsModalVisible] = useState(false)

  const { colors } = useTheme()
  const { t } = useTranslation()
  const { register } = useAuthStore()
  const router = useRouter()

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = (): boolean => {
    if (!formData.full_name.trim()) {
      Toast.error(t("auth.validation.fullNameRequired"))
      return false
    }

    if (!formData.phone_number.trim()) {
      Toast.error(t("auth.validation.phoneRequired"))
      return false
    }

    if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.phone_number)) {
      Toast.error(t("auth.validation.invalidPhone"))
      return false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.error(t("auth.validation.invalidEmail"))
      return false
    }

    return true
  }

  const validatePin = (): boolean => {
    if (formData.pin.length !== 6) {
      Toast.error(t("auth.validation.pinLength"))
      return false
    }

    if (formData.pin !== formData.confirmPin) {
      Toast.error(t("auth.validation.pinMismatch"))
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validatePin()) {
      setFormData((prev) => ({ ...prev, confirmPin: "" }))
      setResetKey((k) => k + 1)
      return
    }

    setLoading(true)
    try {
      const success = await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || "",
        phone_number: formData.phone_number.trim(),
        pin: formData.pin,
        confirmPin: formData.confirmPin,
      })

      if (success) {
        Toast.success(t("auth.register.accountCreated"))
        router.replace("/(tabs)/dashboard")
      }
    } catch (error) {
      console.error("Registration error:", error)
      Toast.error(t("auth.errors.registrationFailed"))
      setFormData((prev) => ({ ...prev, confirmPin: "" }))
      setResetKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!termsAccepted) {
      Toast.error(t("terms.required"))
      return
    }
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handlePinComplete = (pin: string) => {
    setFormData((prev) => ({ ...prev, pin }))
    setStep(3)
  }

  const handleConfirmPinComplete = (confirmPin: string) => {
    setFormData((prev) => ({ ...prev, confirmPin }))
  }

  useEffect(() => {
    if (step === 3 && formData.confirmPin.length === 6) {
      handleSubmit()
    }
  }, [formData.confirmPin])

  // --- STEP 2: CREATE PIN ---
  if (step === 2) {
    return (
      <KeyboardAwareScrollView
        style={[styles.scrollRoot, { backgroundColor: colors.primary[50] }]}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backBtnWrapper}>
          <Pressable
            onPress={() => setStep(1)}
            style={[styles.backCircleBtn, { backgroundColor: "rgba(255,255,255,0.2)", borderColor: colors.primary.default }]}
          >
            <Feather name="chevron-left" size={24} color={colors.primary.default} />
          </Pressable>
        </View>

        <PinInput
          key="create-pin"
          title={t("auth.register.createPin")}
          subtitle={t("auth.register.createPinSubtitle")}
          onComplete={handlePinComplete}
          showBiometric={false}
          length={6}
        />
      </KeyboardAwareScrollView>
    )
  }

  // --- STEP 3: CONFIRM PIN ---
  if (step === 3) {
    return (
      <KeyboardAwareScrollView
        style={[styles.scrollRoot, { backgroundColor: colors.primary[50] }]}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backBtnWrapper}>
          <Pressable
            onPress={() => setStep(2)}
            style={[styles.backCircleBtn, { backgroundColor: "rgba(255,255,255,0.2)", borderColor: colors.primary.default }]}
          >
            <Feather name="chevron-left" size={24} color={colors.primary.default} />
          </Pressable>
        </View>

        <PinInput
          key={`confirm-pin-${resetKey}`}
          title={t("auth.register.confirmPin")}
          subtitle={t("auth.register.confirmPinSubtitle")}
          onComplete={handleConfirmPinComplete}
          showBiometric={false}
          length={6}
        />

        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
              <Loader />
              <Text style={styles.loadingText}>{t("auth.register.creatingAccount")}</Text>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>
    )
  }

  // --- STEP 1: USER INFO ---
  return (
    <KeyboardAwareScrollView
      style={[styles.scrollRoot, { backgroundColor: colors.primary[50] }]}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <FBackButton />

      {/* Conteneur plein écran : contenu centré + boutons absolute en bas */}
      <View style={styles.screen}>
        <Image source={require("@/assets/images/logo/logo.png")} style={styles.logoWatermark} />

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.primary.default }]}>{t("auth.register.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.primary }]}>{t("auth.register.subtitle")}</Text>

          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  step >= i
                    ? { backgroundColor: colors.primary.default, width: 32 }
                    : { backgroundColor: "#d1d5db", width: 16 },
                ]}
              />
            ))}
          </View>

          <View style={styles.inputs}>
            <View style={[styles.inputRow, { backgroundColor: colors.primary[50], borderColor: colors.primary.default }]}>
              <Feather name="user" size={22} color={colors.primary.default} />
              <TextInput
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder={t("auth.register.fullName")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.full_name}
                onChangeText={(text) => handleChange("full_name", text)}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.primary[50], borderColor: colors.primary.default }]}>
              <Feather name="phone" size={22} color={colors.primary.default} />
              <TextInput
                ref={phoneRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder={t("auth.register.phoneNumber")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.phone_number}
                onChangeText={(text) => handleChange("phone_number", text)}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.primary[50], borderColor: colors.primary.default }]}>
              <Feather name="mail" size={22} color={colors.primary.default} />
              <TextInput
                ref={emailRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder={t("auth.register.email")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
        </View>

        {/* Boutons absolute en bas — scrollent avec le contenu quand clavier ouvert */}
        <View style={styles.actions}>
          {/* Checkbox termes et conditions */}
          <Pressable
            onPress={() => setTermsAccepted((v) => !v)}
            style={styles.termsRow}
          >
            <View style={[
              styles.checkbox,
              {
                backgroundColor: termsAccepted ? colors.primary.default : "transparent",
                borderColor: termsAccepted ? colors.primary.default : colors.muted.foreground,
              },
            ]}>
              {termsAccepted && <Feather name="check" size={12} color="#ffffff" />}
            </View>
            <Text style={[styles.termsText, { color: colors.foreground.primary }]}>
              {t("terms.accept")}{" "}
            </Text>
            <Pressable onPress={() => setTermsModalVisible(true)}>
              <Text style={[styles.termsLink, { color: colors.primary.default }]}>
                {t("terms.link")}
              </Text>
            </Pressable>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
          >
            <Feather name="arrow-up-right" size={18} color="#ffffff" />
            <Text style={styles.submitBtnText}>{t("common.continue")}</Text>
          </Pressable>

          <View style={styles.signinRow}>
            <Text style={{ color: colors.foreground.primary }}>{t("auth.register.alreadyHaveAccount")}</Text>
            <Link href="/auth/login">
              <Text style={[styles.signinLink, { color: colors.primary.default }]}>{t("auth.register.signIn")}</Text>
            </Link>
          </View>
        </View>
      </View>

      {/* Modal Termes et Conditions */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.primary.default }]}>
                {t("terms.title")}
              </Text>
              <Pressable onPress={() => setTermsModalVisible(false)}>
                <Feather name="x" size={22} color={colors.foreground.primary} />
              </Pressable>
            </View>

            <Text style={[styles.modalDate, { color: colors.muted.foreground }]}>
              {t("terms.lastUpdated")}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {([
                "storage", "responsibility", "security",
                "usage", "privacy", "limitation", "evolution",
              ] as const).map((section) => (
                <View key={section} style={styles.termSection}>
                  <Text style={[styles.termSectionTitle, { color: colors.primary.default }]}>
                    {t(`terms.sections.${section}.title` as any)}
                  </Text>
                  <Text style={[styles.termSectionContent, { color: colors.foreground.primary }]}>
                    {t(`terms.sections.${section}.content` as any)}
                  </Text>
                </View>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>

            {/* Bouton accepter */}
            <Pressable
              onPress={() => {
                setTermsAccepted(true)
                setTermsModalVisible(false)
              }}
              style={[styles.modalAcceptBtn, { backgroundColor: colors.primary.default }]}
            >
              <Feather name="check" size={18} color="#ffffff" />
              <Text style={styles.modalAcceptText}>{t("common.confirm")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  scrollRoot: { flex: 1 },
  backBtnWrapper: { position: "absolute", top: 112, left: 24, zIndex: 10 },
  backCircleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderWidth: 1,
    borderRadius: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: { borderRadius: 12, padding: 24, alignItems: "center" },
  loadingText: { marginTop: 16, color: "#ffffff" },
  // Plein écran : FBackButton est absolute top:112, le contenu est centré dessous
  screen: {
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWatermark: { width: 160, height: 160, position: "absolute", opacity: 0.05 },
  formContainer: { alignItems: "center", width: "100%" },
  title: { fontSize: 32, fontWeight: "700" },
  subtitle: { fontSize: 15, marginTop: 4 },
  stepIndicator: { flexDirection: "row", gap: 8, marginVertical: 20 },
  stepDot: { height: 8, borderRadius: 999 },
  inputs: { width: "100%", gap: 12, marginTop: 4 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputText: { fontSize: 15, flex: 1 },
  // Absolute dans screen → scrolle avec le contenu, ne chevauche pas les inputs
  actions: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  submitBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    width: "100%",
  },
  submitBtnText: { textAlign: "center", color: "#ffffff", fontWeight: "600", fontSize: 16 },
  signinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12 },
  signinLink: { fontWeight: "700", textDecorationLine: "underline" },

  // Terms checkbox
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  termsText: { fontSize: 14 },
  termsLink: { fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },

  // Terms modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalDate: { fontSize: 12, paddingHorizontal: 24, paddingTop: 8, marginBottom: 4 },
  modalScroll: { paddingHorizontal: 24 },
  termSection: { marginTop: 20 },
  termSectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  termSectionContent: { fontSize: 14, lineHeight: 21 },
  modalAcceptBtn: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalAcceptText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
})
