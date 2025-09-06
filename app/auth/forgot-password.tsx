import { useState, useRef } from "react"
import { View, Text, Pressable, TextInput as RNTextInput, Platform } from "react-native"
import { Link, useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"
import { resetPassword } from "@/services/userService"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { PasswordInput } from "@/components/ui/password-input"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    identifier: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { twColor } = useTwColors()

  // refs
  const identifierRef = useRef<RNTextInput>(null)
  const passwordRef = useRef<any>(null)
  const confirmPasswordRef = useRef<any>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.full_name || !formData.identifier) {
      Alert.error("Full name and email are required", "Error")
      return false
    }

    // Email format
    if (formData.identifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)) {
      Alert.error("Please enter a valid email address", "Error")
      return false
    }

    // Phone format (optionnel)
    if (!formData.identifier.includes("@") && !/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.identifier)) {
      Alert.error("Please enter a valid Cameroonian phone number", "Error")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (formData.newPassword.length < 6) {
      Alert.error("Password must be at least 6 characters", "Error")
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.error("Passwords do not match", "Error")
      return false
    }

    return true
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleResetPassword = async () => {
    if (!validateStep2()) return

    setLoading(true)
    const success = await resetPassword({ identifier: formData.identifier, newPassword: formData.newPassword })
    setLoading(false)

    if (success) {
      router.replace("/auth/login")
    } else {
      Alert.error("Password reset failed", "Error")
    }
  }

  return (
    <KeyboardAwareScrollView
      className="h-full bg-primary-50"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {step === 1 ? (
        <FBackButton />
      ) : (
        <View className="absolute top-28 left-6 z-10">
          <Pressable onPress={() => setStep(1)} className="flex-row items-center justify-center p-2 bg-background/20 border border-primary rounded-full">
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
          </Pressable>
        </View>
      )}

      <View className="flex items-center justify-center h-screen w-full px-8">
        <Text className="text-4xl text-primary font-bold">Forgot Password</Text>
        <Text className="text-lg text-gray-600">Reset your password securely</Text>

        {/* Step indicator */}
        <View className="flex-row gap-2 my-6">
          {[1, 2].map((i) => (
            <View key={i} className={`h-2 rounded-full ${step >= i ? "bg-primary w-8" : "bg-gray-300 w-4"}`} />
          ))}
        </View>

        {step === 1 ? (
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
        ) : (
          <View className="w-full mt-4 flex-col gap-4">
            {/* New Password */}
            <View className="bg-primary-50 border border-primary rounded-lg flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                ref={passwordRef}
                className="text-xl flex-1"
                placeholder="New Password"
                value={formData.newPassword}
                onChangeText={(text) => handleChange("newPassword", text)}
                iconColor={twColor("text-primary")}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
            </View>

            {/* Confirm Password */}
            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                ref={confirmPasswordRef}
                className="text-xl flex-1"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                iconColor={twColor("text-primary")}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>
          </View>
        )}

        {/* Boutons en bas */}
        <View className="w-full px-10 mt-8 mb-10 absolute bottom-0">
          <Pressable
            onPress={step === 1 ? handleContinue : handleResetPassword}
            disabled={loading}
            className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}
          >
            {step === 1 ? <Feather name="arrow-up-right" size={24} color={twColor("text-white")} /> : <Feather name="send" size={24} color={twColor("text-white")} />}
            <Text className="text-center text-white font-semibold text-lg">{loading ? "Processing..." : step === 1 ? "Continue" : "Reset Password"}</Text>
          </Pressable>

          {step === 2 && (
            <Pressable onPress={() => setStep(1)} className="mt-4 flex-row items-center justify-center gap-2">
              <Feather name="arrow-left" size={16} color={twColor("text-primary")} />
              <Text className="text-center text-primary font-semibold">Back to identity</Text>
            </Pressable>
          )}

          <View className="flex-row justify-center items-center gap-3 mt-3">
            <Text>Remember your password?</Text>
            <Link href="/auth/login" className="text-primary font-bold underline">
              Sign In
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
