import { SheetModal, sheetSectionStyles } from "@/components/feature/sheet-modal"
import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Image, ImageBackground, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const TERMS_SECTION_ICONS = {
  storage: "smartphone",
  responsibility: "alert-triangle",
  security: "lock",
  usage: "check-circle",
  privacy: "shield",
  limitation: "info",
  evolution: "zap",
} as const

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
  const insets = useSafeAreaInsets()

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const keyboardPadding = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardPadding, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start()
    })
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardPadding, { toValue: 0, duration: 250, useNativeDriver: false }).start()
    })
    return () => { show.remove(); hide.remove() }
  }, [])

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
    if (validateStep1()) setStep(2)
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
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.pinBack, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={() => setStep(1)}
            style={[styles.backCircleBtn, { borderColor: colors.border }]}
          >
            <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
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
      </View>
    )
  }

  // --- STEP 3: CONFIRM PIN ---
  if (step === 3) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.pinBack, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={() => setStep(2)}
            style={[styles.backCircleBtn, { borderColor: colors.border }]}
          >
            <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
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
      </View>
    )
  }

  // --- STEP 1: USER INFO ---
  return (
    <ImageBackground
      source={require("@/assets/images/bg/bg-login-2.png")}
      style={styles.root}
      resizeMode="cover"
      blurRadius={4}
    >
      <View style={styles.bgOverlay} />

      <FBackButton />

      <Animated.View style={{ flex: 1, paddingBottom: keyboardPadding }}>
        {/* Hero — le flex spacer compresse quand le clavier monte */}
        <View style={[styles.heroWrapper, { paddingTop: insets.top + 60 }]}>
          <Image
            source={require("@/assets/images/logo/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>{t("auth.register.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("auth.register.subtitle")}</Text>
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  step >= i
                    ? { backgroundColor: "#ffffff", width: 32 }
                    : { backgroundColor: "rgba(255,255,255,0.3)", width: 16 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={[styles.sheet, { backgroundColor: colors.background.primary, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.inputs}>
            <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="user" size={18} color={colors.muted.foreground} />
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

            <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="phone" size={18} color={colors.muted.foreground} />
              <TextInput
                ref={phoneRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder="6XX XXX XXX"
                placeholderTextColor={colors.muted.foreground}
                value={formData.phone_number}
                onChangeText={(text) => handleChange("phone_number", text)}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.muted.foreground} />
              <TextInput
                ref={emailRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder={t("auth.register.email")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType={termsAccepted ? "done" : "next"}
                onSubmitEditing={termsAccepted ? handleContinue : undefined}
              />
            </View>
          </View>

          {/* Terms */}
          <Pressable onPress={() => setTermsAccepted((v) => !v)} style={styles.termsRow}>
            <View style={[
              styles.checkbox,
              {
                backgroundColor: termsAccepted ? colors.primary.default : "transparent",
                borderColor: termsAccepted ? colors.primary.default : colors.muted.foreground,
              },
            ]}>
              {termsAccepted && <Feather name="check" size={12} color="#ffffff" />}
            </View>
            <Text style={[styles.termsText, { color: colors.foreground.primary }]}>{t("terms.accept")} </Text>
            <Pressable onPress={() => setTermsModalVisible(true)}>
              <Text style={[styles.termsLink, { color: colors.primary.default }]}>{t("terms.link")}</Text>
            </Pressable>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={loading || !termsAccepted}
            style={[
              styles.submitBtn,
              {
                backgroundColor: termsAccepted ? colors.primary.default : colors.muted.default,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.submitBtnText, { color: termsAccepted ? "#ffffff" : colors.muted.foreground }]}>
              {t("common.continue")}
            </Text>
            <Feather name="arrow-right" size={18} color={termsAccepted ? "#ffffff" : colors.muted.foreground} />
          </Pressable>

          <View style={styles.signinRow}>
            <Text style={{ color: colors.muted.foreground, fontSize: 14 }}>{t("auth.register.alreadyHaveAccount")}</Text>
            <Link href="/auth/login">
              <Text style={[styles.signinLink, { color: colors.primary.default }]}>{t("auth.register.signIn")}</Text>
            </Link>
          </View>
        </View>
      </Animated.View>

      <SheetModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        onAction={() => setTermsAccepted(true)}
        title={t("terms.title")}
        actionLabel={t("common.confirm")}
      >
        <Text style={[{ fontSize: 12, color: colors.muted.foreground, paddingTop: 8, marginBottom: 4 }]}>
          {t("terms.lastUpdated")}
        </Text>
        {(Object.keys(TERMS_SECTION_ICONS) as (keyof typeof TERMS_SECTION_ICONS)[]).map((section) => (
          <View key={section} style={sheetSectionStyles.section}>
            <View style={sheetSectionStyles.sectionHeader}>
              <Feather name={TERMS_SECTION_ICONS[section]} size={15} color={colors.primary.default} />
              <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
                {t(`terms.sections.${section}.title` as any)}
              </Text>
            </View>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>
              {t(`terms.sections.${section}.content` as any)}
            </Text>
          </View>
        ))}
      </SheetModal>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  heroWrapper: { alignItems: "center", paddingHorizontal: 32 },
  logo: { width: 72, height: 72, marginBottom: 16, borderRadius: 16 },
  heroTitle: { fontSize: 30, fontWeight: "700", color: "#ffffff", textAlign: "center" },
  heroSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 6 },
  stepIndicator: { flexDirection: "row", gap: 8, marginTop: 16 },
  stepDot: { height: 6, borderRadius: 999 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 16,
    marginTop: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.4)",
    alignSelf: "center",
    marginBottom: 24,
  },
  inputs: { gap: 12, marginBottom: 28 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputText: { fontSize: 15, flex: 1 },
  termsRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
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
  submitBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    width: "100%",
    marginBottom: 16,
  },
  submitBtnText: { textAlign: "center", fontWeight: "600", fontSize: 16 },
  signinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  signinLink: { fontWeight: "700", fontSize: 14 },
  pinBack: { paddingHorizontal: 24, marginBottom: 8 },
  backCircleBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: { borderRadius: 12, padding: 24, alignItems: "center" },
  loadingText: { marginTop: 16, color: "#ffffff" },
})
