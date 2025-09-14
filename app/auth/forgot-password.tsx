import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTwColors } from "@/lib/tw-colors"
import { resetPin } from "@/services/userService"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Platform, Pressable, TextInput as RNTextInput, Text, View } from "react-native"
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
  const [shouldSubmit, setShouldSubmit] = useState(false)

  const router = useRouter()
  const { twColor } = useTwColors()

  const identifierRef = useRef<RNTextInput>(null)

  // Effect pour gérer la soumission après mise à jour du confirmPin
  useEffect(() => {
    if (shouldSubmit && formData.confirmPin) {
      setShouldSubmit(false)
      handleSubmitPin()
    }
  }, [formData.confirmPin, shouldSubmit])

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
      // Reset du champ de confirmation
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
    // On marque qu'on doit soumettre après la mise à jour du state
    setShouldSubmit(true)
  }

  // --- STEP 2: NEW PIN ---
  if (step === 2) {
    return (
      <KeyboardAwareScrollView
        className="h-full bg-primary-50"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="absolute top-28 left-6 z-10">
          <Pressable onPress={() => setStep(1)} className="flex-row items-center justify-center p-2 bg-background/20 border border-primary rounded-full">
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
          </Pressable>
        </View>

        <PinInput key="new-pin" title="New PIN" subtitle="Create a new 6-digit PIN" onComplete={handlePinComplete} showBiometric={false} length={6} />
      </KeyboardAwareScrollView>
    )
  }

  // --- STEP 3: CONFIRM PIN ---
  if (step === 3) {
    return (
      <KeyboardAwareScrollView
        className="h-full bg-primary-50"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="absolute top-28 left-6 z-10">
          <Pressable onPress={() => setStep(2)} className="flex-row items-center justify-center p-2 bg-background/20 border border-primary rounded-full">
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
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
          <View className="absolute inset-0 bg-black/30 flex-1 justify-center items-center">
            <View className="bg-primary rounded-xl p-6 items-center">
              <Loader />
              <Text className="mt-4 text-white">Resetting PIN...</Text>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>
    )
  }

  // --- STEP 1: USER INFO ---
  return (
    <KeyboardAwareScrollView
      className="h-full bg-primary-50"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <FBackButton />

      <View className="flex items-center justify-center h-screen w-full px-8">
        <Text className="text-4xl text-primary font-bold">Forgot PIN</Text>
        <Text className="text-lg text-gray-600">Reset your PIN securely</Text>

        {/* Step indicator */}
        <View className="flex-row gap-2 my-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className={`h-2 rounded-full ${step >= i ? "bg-primary w-8" : "bg-gray-300 w-4"}`} />
          ))}
        </View>

        <View className="w-full mt-4 flex-col gap-4">
          {/* Full name */}
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="user" size={24} color={twColor("text-primary")} />
            <RNTextInput
              className="text-xl flex-1"
              placeholder="Full name"
              value={formData.full_name}
              onChangeText={(text) => handleChange("full_name", text)}
              returnKeyType="next"
              onSubmitEditing={() => identifierRef.current?.focus()}
            />
          </View>

          {/* Email or Phone */}
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="mail" size={24} color={twColor("text-primary")} />
            <RNTextInput
              ref={identifierRef}
              className="text-xl flex-1"
              placeholder="you@example.com or 6xx xxx xxx"
              value={formData.identifier}
              onChangeText={(text) => handleChange("identifier", text)}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </View>

        {/* Bottom buttons */}
        <View className="w-full px-10 mt-8 mb-10 absolute bottom-0">
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}
          >
            <Feather name="arrow-up-right" size={24} color={twColor("text-white")} />
            <Text className="text-center text-white font-semibold text-lg">Continue</Text>
          </Pressable>

          <View className="flex-row justify-center items-center gap-3 mt-3">
            <Text>Remember your PIN?</Text>
            <Link href="/auth/login" className="text-primary font-bold underline">
              Sign In
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
