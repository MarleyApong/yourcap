import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { hasValidSessionForQuickAuth, setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export default function Login() {
  const { login, loginWithBiometric, biometricCapabilities, checkBiometricCapabilities } = useAuthStore()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const identifierRef = useRef<TextInput>(null)

  const [identifier, setIdentifier] = useState("")
  const [showPinInput, setShowPinInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pinKey, setPinKey] = useState(0)
  const [shouldShowBiometric, setShouldShowBiometric] = useState(false)
  const [isQuickAuth, setIsQuickAuth] = useState(false)

  useEffect(() => {
    checkBiometricCapabilities()
    initializeLoginState()
  }, [])

  const initializeLoginState = async () => {
    try {
      const quickAuthSession = await hasValidSessionForQuickAuth()

      console.log("Login init - Quick auth session:", quickAuthSession)

      if (quickAuthSession.hasValidSession) {
        setIdentifier(quickAuthSession.identifier!)
        setShowPinInput(true)
        setIsQuickAuth(true)
        setShouldShowBiometric(quickAuthSession.biometricEnabled || false)

        await setAppLocked(false)
      }
    } catch (error) {
      console.error("Error initializing login state:", error)
    }
  }

  const validateIdentifier = (value: string): boolean => {
    if (!value.trim()) {
      Toast.error("Please enter your email or phone number")
      return false
    }

    if (value.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        Toast.error("Please enter a valid email address")
        return false
      }
    } else {
      if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(value)) {
        Toast.error("Please enter a valid Cameroonian phone number")
        return false
      }
    }

    return true
  }

  const handleIdentifierSubmit = () => {
    if (validateIdentifier(identifier)) {
      setShowPinInput(true)
      setIsQuickAuth(false)
    }
  }

  const handlePinComplete = async (pin: string) => {
    setLoading(true)
    try {
      const success = await login({ identifier: identifier.trim(), pin })
      if (success) {
        Toast.success("Welcome back!")
      } else {
        Toast.error("Invalid credentials. Please try again.")
        setPinKey((prev) => prev + 1)
      }
    } catch (err) {
      console.error("Login error:", err)
      Toast.error("An unexpected error occurred. Please try again later.")
      setPinKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometric = async () => {
    setLoading(true)
    try {
      const success = await loginWithBiometric()
      if (success) {
        Toast.success("Welcome back!")
      } else {
        Toast.error("Biometric authentication failed")
      }
    } catch (err) {
      console.error("Biometric error:", err)
      Toast.error("Biometric authentication error")
    } finally {
      setLoading(false)
    }
  }

  const handleBackFromPin = () => {
    if (isQuickAuth) {
      setShowPinInput(false)
      setIdentifier("")
      setIsQuickAuth(false)
      setShouldShowBiometric(false)
    } else {
      setShowPinInput(false)
    }
    setPinKey((prev) => prev + 1)
  }

  if (showPinInput) {
    return (
      <View style={[styles.root, { backgroundColor: colors.primary[50] }]}>
        {!isQuickAuth && <FBackButton onPress={handleBackFromPin} />}

        {isQuickAuth && (
          <View style={styles.quickAuthHeader}>
            <TouchableOpacity onPress={handleBackFromPin} style={styles.quickAuthBack}>
              <Feather name="chevron-left" size={24} color={colors.primary.default} />
              <Text style={[styles.quickAuthBackText, { color: colors.primary.default }]}>
                {t("auth.login.useDifferentAccount")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.quickAuthWelcome, { color: colors.muted.foreground }]}>
              Welcome back, {identifier}
            </Text>
          </View>
        )}

        <PinInput
          key={`pin-${pinKey}`}
          title={isQuickAuth ? t("auth.login.verifyIdentity") : t("auth.login.pinTitle")}
          subtitle={isQuickAuth ? t("auth.login.biometricSubtitle") : t("auth.login.pinSubtitle")}
          onComplete={handlePinComplete}
          onBiometric={handleBiometric}
          biometricAvailable={biometricCapabilities?.isAvailable && shouldShowBiometric}
          showBiometric={shouldShowBiometric}
        />

        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
              <Loader />
              <Text style={styles.loadingText}>{t("auth.login.verifyIdentity")}</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary[50] }]}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <FBackButton path="/" />

        <View style={styles.heroImage}>
          <Image source={require("@/assets/images/bg/bg-login-2.png")} style={styles.bgImage} resizeMode="cover" />
          <View style={styles.bgOverlay} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formInner}>
            <Image
              source={require("@/assets/images/logo/logo.png")}
              style={styles.logoWatermark}
            />

            <Text style={[styles.title, { color: colors.primary.default }]}>{t("auth.login.welcomeBack")}</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.primary }]}>{t("auth.login.subtitle")}</Text>

            <View style={styles.inputs}>
              <View style={[styles.inputRow, { backgroundColor: colors.primary[50], borderColor: colors.primary.default }]}>
                <Feather name="mail" size={24} color={colors.primary.default} />
                <TextInput
                  ref={identifierRef}
                  style={[styles.inputText, { color: colors.foreground.primary }]}
                  placeholder={t("auth.login.emailOrPhone")}
                  placeholderTextColor={colors.muted.foreground}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="default"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleIdentifierSubmit}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleIdentifierSubmit}
                disabled={loading}
                style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
              >
                <Text style={styles.submitBtnText}>{t("common.continue")}</Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={{ color: colors.foreground.primary }}>{t("auth.login.dontHaveAccount")}</Text>
                <Link href="/auth/register">
                  <Text style={[styles.signupLink, { color: colors.primary.default }]}>Sign up</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  quickAuthHeader: { paddingTop: 48, paddingHorizontal: 32 },
  quickAuthBack: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  quickAuthBackText: { fontWeight: "500" },
  quickAuthWelcome: { fontSize: 18, marginBottom: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: { borderRadius: 12, padding: 24, alignItems: "center" },
  loadingText: { marginTop: 16, color: "#ffffff" },
  heroImage: { position: "relative" },
  bgImage: { height: 360, width: "100%" },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  formContainer: { flex: 1, justifyContent: "space-between" },
  formInner: { alignItems: "center", width: "100%", paddingHorizontal: 32, marginTop: 24 },
  logoWatermark: { width: 160, height: 160, position: "absolute", opacity: 0.05 },
  title: { fontSize: 30, fontWeight: "700" },
  subtitle: { fontSize: 16 },
  inputs: { width: "100%", marginTop: 20, gap: 12 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inputText: { fontSize: 15, flex: 1 },
  actions: { width: "100%", paddingHorizontal: 16, paddingBottom: 32, marginTop: 24 },
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
  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12 },
  signupLink: { fontWeight: "700", textDecorationLine: "underline" },
})
