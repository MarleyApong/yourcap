import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { resetPin } from "@/services/userService"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Image, ImageBackground, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    identifier: "",
    newPin: "",
    confirmPin: "",
  })
  const [loading, setLoading] = useState(false)
  const [confirmKey, setConfirmKey] = useState(0)

  const router = useRouter()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const identifierRef = useRef<TextInput>(null)
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

  useEffect(() => {
    if (step === 3 && formData.confirmPin.length === 6) {
      handleSubmitPin()
    }
  }, [formData.confirmPin])

  const validateStep1 = () => {
    if (!formData.full_name.trim() || !formData.identifier.trim()) {
      Toast.error(t("auth.forgotPassword.identifierRequired"), t("common.error"))
      return false
    }
    if (formData.identifier.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)) {
        Toast.error(t("auth.validation.invalidEmail"), t("common.error"))
        return false
      }
    } else {
      if (!/^\+?[0-9]{7,15}$/.test(formData.identifier.replace(/[\s\-().]/g, ""))) {
        Toast.error(t("auth.validation.invalidPhone"), t("common.error"))
        return false
      }
    }
    return true
  }

  const handleContinue = () => {
    if (validateStep1()) setStep(2)
  }

  const handlePinComplete = (pin: string) => {
    setFormData((prev) => ({ ...prev, newPin: pin }))
    setStep(3)
  }

  const handleConfirmPinComplete = (confirmPin: string) => {
    setFormData((prev) => ({ ...prev, confirmPin }))
  }

  const handleSubmitPin = async () => {
    if (formData.newPin !== formData.confirmPin) {
      Toast.error(t("auth.validation.pinMismatch"), t("common.error"))
      setFormData((prev) => ({ ...prev, confirmPin: "" }))
      setConfirmKey((k) => k + 1)
      return
    }
    setLoading(true)
    try {
      const success = await resetPin({ identifier: formData.identifier, newPin: formData.newPin })
      if (success) {
        router.replace("/auth/login")
      } else {
        Toast.error(t("auth.forgotPassword.resetFailed"), t("common.error"))
        setFormData((prev) => ({ ...prev, confirmPin: "" }))
        setConfirmKey((k) => k + 1)
      }
    } catch {
      Toast.error(t("auth.forgotPassword.resetFailed"), t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  // --- STEP 2: NEW PIN ---
  if (step === 2) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.pinBack, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => setStep(1)} style={[styles.backCircleBtn, { borderColor: colors.border }]}>
            <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
          </Pressable>
        </View>
        <PinInput
          key="new-pin"
          title={t("auth.forgotPassword.newPin")}
          subtitle={t("auth.forgotPassword.newPinSub")}
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
          <Pressable onPress={() => setStep(2)} style={[styles.backCircleBtn, { borderColor: colors.border }]}>
            <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
          </Pressable>
        </View>
        <PinInput
          key={`confirm-pin-${confirmKey}`}
          title={t("auth.forgotPassword.confirmPin")}
          subtitle={t("auth.forgotPassword.confirmPinSub")}
          onComplete={handleConfirmPinComplete}
          showBiometric={false}
          length={6}
        />
        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
              <Loader color={colors.primary.foreground} />
              <Text style={[styles.loadingText, { color: colors.primary.foreground }]}>
                {t("auth.forgotPassword.resetting")}
              </Text>
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
        <View style={[styles.heroWrapper, { paddingTop: insets.top + 60 }]}>
          <Image
            source={require("@/assets/images/logo/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>{t("auth.forgotPassword.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("auth.forgotPassword.subtitle")}</Text>
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
                placeholder={t("auth.forgotPassword.fullName")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.full_name}
                onChangeText={(v) => setFormData((p) => ({ ...p, full_name: v }))}
                returnKeyType="next"
                onSubmitEditing={() => identifierRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.muted.foreground} />
              <TextInput
                ref={identifierRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder={t("auth.forgotPassword.identifier")}
                placeholderTextColor={colors.muted.foreground}
                value={formData.identifier}
                onChangeText={(v) => setFormData((p) => ({ ...p, identifier: v }))}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={[styles.submitBtnText, { color: colors.primary.foreground }]}>{t("common.continue")}</Text>
            <Feather name="arrow-right" size={18} color={colors.primary.foreground} />
          </Pressable>

          <View style={[styles.signinRow, { paddingBottom: 0 }]}>
            <Text style={{ color: colors.muted.foreground, fontSize: 14 }}>{t("auth.forgotPassword.rememberPin")}</Text>
            <Link href="/auth/login">
              <Text style={[styles.signinLink, { color: colors.primary.default }]}>{t("auth.register.signIn")}</Text>
            </Link>
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  heroWrapper: { alignItems: "center", paddingHorizontal: 32, flexShrink: 1, overflow: "hidden" },
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
  inputs: { gap: 12, marginBottom: 20 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputText: { fontSize: 15, flex: 1 },
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
