import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { hasValidSessionForQuickAuth, setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Image, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Login() {
  const { login, loginWithBiometric, biometricCapabilities, checkBiometricCapabilities } = useAuthStore()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const identifierRef = useRef<TextInput>(null)
  const canGoBack = router.canGoBack()

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
      Toast.error(t("auth.validation.pleaseEnterEmailOrPhone"))
      return false
    }
    if (value.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        Toast.error(t("auth.validation.invalidEmail"))
        return false
      }
    } else {
      if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(value)) {
        Toast.error(t("auth.validation.invalidPhone"))
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
        Toast.success(t("auth.login.welcomeBack"))
      } else {
        Toast.error(t("auth.validation.invalidCredentials"))
        setPinKey((prev) => prev + 1)
      }
    } catch (err) {
      console.error("Login error:", err)
      Toast.error(t("auth.errors.unexpectedError"))
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
        Toast.success(t("auth.login.welcomeBack"))
      } else {
        Toast.error(t("auth.errors.biometricFailed"))
      }
    } catch (err) {
      console.error("Biometric error:", err)
      Toast.error(t("auth.errors.biometricError"))
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
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
        {!isQuickAuth && <FBackButton onPress={handleBackFromPin} />}

        {isQuickAuth && (
          <View style={[styles.quickAuthHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={handleBackFromPin} style={styles.quickAuthBack}>
              <Feather name="chevron-left" size={24} color={colors.primary.default} />
              <Text style={[styles.quickAuthBackText, { color: colors.primary.default }]}>
                {t("auth.login.useDifferentAccount")}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.quickAuthWelcome, { color: colors.muted.foreground }]}>
              {t("auth.login.welcomeBackUser").replace("{name}", identifier)}
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
    <ImageBackground
      source={require("@/assets/images/bg/bg-login-2.png")}
      style={styles.root}
      resizeMode="cover"
      blurRadius={4}
    >
      <View style={styles.bgOverlay} />

      {canGoBack && <FBackButton path="/" />}

      {/* Logo + titre sur l'image */}
      <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
        <Image
          source={require("@/assets/images/logo/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>{t("auth.login.welcomeBack")}</Text>
        <Text style={styles.heroSubtitle}>{t("auth.login.subtitle")}</Text>
      </View>

      {/* Bottom sheet form */}
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      >

        <View style={[styles.sheet, { backgroundColor: colors.background.primary }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.inputs}>
            <Text style={[styles.inputLabel, { color: colors.muted.foreground }]}>
              {t("auth.login.phoneOrEmail")}
            </Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Feather name="user" size={18} color={colors.muted.foreground} />
              <TextInput
                ref={identifierRef}
                style={[styles.inputText, { color: colors.foreground.primary }]}
                placeholder="6XX XXX XXX / email@example.com"
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

          <TouchableOpacity
            onPress={handleIdentifierSubmit}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={styles.submitBtnText}>{t("common.continue")}</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={[styles.signupRow, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={{ color: colors.muted.foreground, fontSize: 14 }}>{t("auth.login.dontHaveAccount")}</Text>
            <Link href="/auth/register">
              <Text style={[styles.signupLink, { color: colors.primary.default }]}>{t("auth.login.signUp")}</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  hero: { alignItems: "center", paddingHorizontal: 32 },
  logo: { width: 72, height: 72, marginBottom: 20, borderRadius: 16 },
  heroTitle: { fontSize: 32, fontWeight: "700", color: "#ffffff", textAlign: "center" },
  heroSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 8 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 48,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.4)",
    alignSelf: "center",
    marginBottom: 28,
  },
  inputLabel: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  inputs: { marginBottom: 20 },
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
  submitBtnText: { textAlign: "center", color: "#ffffff", fontWeight: "600", fontSize: 16 },
  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  signupLink: { fontWeight: "700", fontSize: 14 },
  quickAuthHeader: { paddingHorizontal: 32 },
  quickAuthBack: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  quickAuthBackText: { fontWeight: "500" },
  quickAuthWelcome: { fontSize: 18, marginBottom: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: { borderRadius: 12, padding: 24, alignItems: "center" },
  loadingText: { marginTop: 16, color: "#ffffff" },
})
