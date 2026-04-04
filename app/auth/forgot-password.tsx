import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { resetPin } from "@/services/userService"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Platform, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

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

  const identifierRef = useRef<RNTextInput>(null)

  useEffect(() => {
    if (step === 3 && formData.confirmPin.length === 6) {
      handleSubmitPin()
    }
  }, [formData.confirmPin])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.full_name || !formData.identifier) {
      Toast.error("Full name and email/phone are required", "Error")
      return false
    }

    if (formData.identifier.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)) {
        Toast.error("Please enter a valid email address", "Error")
        return false
      }
    } else {
      if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.identifier)) {
        Toast.error("Please enter a valid Cameroonian phone number", "Error")
        return false
      }
    }

    return true
  }

  const validatePin = () => {
    if (formData.newPin.length !== 6) {
      Toast.error("PIN must be 6 digits", "Error")
      return false
    }
    if (formData.newPin !== formData.confirmPin) {
      Toast.error("PINs do not match", "Error")
      return false
    }
    return true
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handlePinComplete = (pin: string) => {
    setFormData((prev) => ({ ...prev, newPin: pin }))
    setStep(3)
  }

  const handleSubmitPin = async () => {
    if (!validatePin()) {
      setFormData((prev) => ({ ...prev, confirmPin: "" }))
      setConfirmKey((prev) => prev + 1)
      return
    }

    setLoading(true)
    try {
      const success = await resetPin({
        identifier: formData.identifier,
        newPin: formData.newPin,
      })
      if (success) {
        router.replace("/auth/login")
      }
    } catch (err) {
      Toast.error("Failed to reset PIN. Try again.", "Error")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPinComplete = (confirmPin: string) => {
    setFormData((prev) => ({ ...prev, confirmPin }))
  }

  // --- STEP 2: NEW PIN ---
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
          key="new-pin"
          title="New PIN"
          subtitle="Create a new 6-digit PIN"
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
          key={`confirm-pin-${confirmKey}`}
          title="Confirm PIN"
          subtitle="Enter your new 6-digit PIN again to confirm"
          onComplete={handleConfirmPinComplete}
          showBiometric={false}
          length={6}
        />

        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
              <Loader />
              <Text style={styles.loadingText}>Resetting PIN...</Text>
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

      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: colors.primary.default }]}>Forgot PIN</Text>
        <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>Reset your PIN securely</Text>

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
            <Feather name="user" size={24} color={colors.primary.default} />
            <RNTextInput
              style={[styles.inputText, { color: colors.foreground.primary }]}
              placeholder="Full name"
              placeholderTextColor={colors.muted.foreground}
              value={formData.full_name}
              onChangeText={(text) => handleChange("full_name", text)}
              returnKeyType="next"
              onSubmitEditing={() => identifierRef.current?.focus()}
            />
          </View>

          <View style={[styles.inputRow, { backgroundColor: colors.primary[50], borderColor: colors.primary.default }]}>
            <Feather name="mail" size={24} color={colors.primary.default} />
            <RNTextInput
              ref={identifierRef}
              style={[styles.inputText, { color: colors.foreground.primary }]}
              placeholder="you@example.com or 6xx xxx xxx"
              placeholderTextColor={colors.muted.foreground}
              value={formData.identifier}
              onChangeText={(text) => handleChange("identifier", text)}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
          >
            <Feather name="arrow-up-right" size={24} color="#ffffff" />
            <Text style={styles.submitBtnText}>Continue</Text>
          </Pressable>

          <View style={styles.signinRow}>
            <Text style={{ color: colors.foreground.primary }}>Remember your PIN?</Text>
            <Link href="/auth/login">
              <Text style={[styles.signinLink, { color: colors.primary.default }]}>Sign In</Text>
            </Link>
          </View>
        </View>
      </View>
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
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 32,
  },
  title: { fontSize: 36, fontWeight: "700" },
  subtitle: { fontSize: 18 },
  stepIndicator: { flexDirection: "row", gap: 8, marginVertical: 24 },
  stepDot: { height: 8, borderRadius: 999 },
  inputs: { width: "100%", marginTop: 16, gap: 16 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputText: { fontSize: 20, flex: 1 },
  actions: {
    width: "100%",
    paddingHorizontal: 40,
    marginTop: 32,
    marginBottom: 40,
    position: "absolute",
    bottom: 0,
  },
  submitBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  submitBtnText: { textAlign: "center", color: "#ffffff", fontWeight: "600", fontSize: 18 },
  signinRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12 },
  signinLink: { fontWeight: "700", textDecorationLine: "underline" },
})
