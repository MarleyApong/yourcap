import { FBackButton } from "@/components/ui/fback-button"
import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTwColors } from "@/lib/tw-colors"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Image, Platform, Pressable, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

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

  const { twColor } = useTwColors()
  const { register } = useAuthStore()
  const router = useRouter()

  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = (): boolean => {
    if (!formData.full_name.trim()) {
      Toast.error("Full name is required")
      return false
    }

    if (!formData.phone_number.trim()) {
      Toast.error("Phone number is required")
      return false
    }

    if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.phone_number)) {
      Toast.error("Please enter a valid Cameroonian phone number")
      return false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.error("Please enter a valid email address")
      return false
    }

    return true
  }

  const validatePin = (): boolean => {
    if (formData.pin.length !== 6) {
      Toast.error("PIN must be 6 digits")
      return false
    }

    if (formData.pin !== formData.confirmPin) {
      Toast.error("PINs do not match")
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
        Toast.success("Account created successfully!")
        router.replace("/(tabs)/dashboard")
      }
    } catch (error) {
      console.error("Registration error:", error)
      Toast.error("Registration failed. Please try again.")
      setFormData((prev) => ({ ...prev, confirmPin: "" }))
      setResetKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
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

        <PinInput key="create-pin" title="Create PIN" subtitle="Create a 6-digit PIN for your account" onComplete={handlePinComplete} showBiometric={false} length={6} />
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
          key={`confirm-pin-${resetKey}`}
          title="Confirm PIN"
          subtitle="Enter your 6-digit PIN again to confirm"
          onComplete={handleConfirmPinComplete}
          showBiometric={false}
          length={6}
        />

        {loading && (
          <View className="absolute inset-0 bg-black/30 flex-1 justify-center items-center">
            <View className="bg-primary rounded-xl p-6 items-center">
              <Loader />
              <Text className="mt-4 text-white">Creating your account...</Text>
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
        <Image source={require("@/assets/images/logo/logo.png")} className="w-60 h-60 absolute opacity-5" />
        <Text className="text-5xl text-primary font-bold">Register</Text>
        <Text className="text-2xl">Create your account</Text>

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
            <TextInput
              className="text-xl flex-1"
              placeholder="Full name"
              value={formData.full_name}
              onChangeText={(text) => handleChange("full_name", text)}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>

          {/* Phone (required) */}
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="phone" size={24} color={twColor("text-primary")} />
            <TextInput
              ref={phoneRef}
              className="text-xl flex-1"
              placeholder="6xx xxx xxx or 2xx xxx xxx"
              value={formData.phone_number}
              onChangeText={(text) => handleChange("phone_number", text)}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          {/* Email (optional) */}
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="mail" size={24} color={twColor("text-primary")} />
            <TextInput
              ref={emailRef}
              className="text-xl flex-1"
              placeholder="Email (optional)"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </View>

        {/* Buttons */}
        <View className="w-full px-10 mt-8 mb-10 absolute bottom-0">
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}
          >
            <Feather name="arrow-up-right" size={18} color={twColor("text-white")} />
            <Text className="text-center text-white font-semibold text-lg">Continue</Text>
          </Pressable>

          <View className="flex-row justify-center items-center gap-3 mt-3">
            <Text>Already have an account?</Text>
            <Link href="/auth/login" className="text-primary font-bold underline">
              Sign in
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
