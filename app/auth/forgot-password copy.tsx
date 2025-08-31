import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Pressable, Text, TextInput, View, Platform } from "react-native"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { PasswordInput } from "@/components/ui/password-input"
import { resetPassword } from "@/services/userService"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    identifier: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const { twColor } = useTwColors()
  const router = useRouter()

  // Refs
  const passwordRef = useRef<any>(null)
  const confirmPasswordRef = useRef<any>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.identifier) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email or phone number",
      })
      return false
    }

    // Vérif email OU phone simple
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)
    const isPhone = /^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.identifier)

    if (!isEmail && !isPhone) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid email or phone number",
      })
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter and confirm your new password",
      })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text2: "Passwords do not match",
      })
      return false
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text2: "Password must be at least 6 characters",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setLoading(true)
    const success = await resetPassword({
      identifier: formData.identifier,
      newPassword: formData.newPassword,
    })
    setLoading(false)

    if (success) {
      router.replace("/auth/login")
    }
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2)
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
          <Pressable
            onPress={() => setStep(1)}
            className="flex-row items-center justify-center p-2 bg-background/20 border border-primary rounded-full"
          >
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
          </Pressable>
        </View>
      )}

      <View className="flex items-center justify-center h-screen w-full px-8">
        <Text className="text-5xl text-primary font-bold">Forgot</Text>
        <Text className="text-2xl">Reset your password</Text>

        {/* Step indicator */}
        <View className="flex-row gap-2 my-6">
          {[1, 2].map((i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                step >= i ? "bg-primary w-8" : "bg-gray-300 w-4"
              }`}
            />
          ))}
        </View>

        {step === 1 ? (
          <View className="w-full mt-4 flex-col gap-4">
            {/* Identifier */}
            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="user" size={24} color={twColor("text-primary")} />
              <TextInput
                className="text-xl flex-1"
                placeholder="Email or phone"
                value={formData.identifier}
                onChangeText={(text) => handleChange("identifier", text)}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
        ) : (
          <View className="w-full mt-4 flex-col gap-4">
            {/* New password */}
            <View className="bg-primary-50 border border-primary rounded-lg flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                ref={passwordRef}
                className="text-xl flex-1"
                placeholder="New password"
                value={formData.newPassword}
                onChangeText={(text) => handleChange("newPassword", text)}
                iconColor={twColor("text-primary")}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
            </View>

            {/* Confirm password */}
            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                ref={confirmPasswordRef}
                className="text-xl flex-1"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                iconColor={twColor("text-primary")}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>
        )}

        {/* Boutons en bas */}
        <View className="w-full px-10 mt-8 mb-10 absolute bottom-0">
          <Pressable
            onPress={step === 1 ? handleContinue : handleSubmit}
            disabled={loading}
            className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${
              loading ? "opacity-70" : ""
            }`}
          >
            {step === 1 ? (
              <Feather
                name="arrow-up-right"
                size={24}
                color={twColor("text-white")}
              />
            ) : (
              <Feather
                name="send"
                size={24}
                color={twColor("text-white")}
              />
            )}
            <Text className="text-center text-white font-semibold text-lg">
              {loading
                ? "Processing..."
                : step === 1
                ? "Continue"
                : "Reset Password"}
            </Text>
          </Pressable>

          {step === 2 && (
            <Pressable
              onPress={() => setStep(1)}
              className="mt-4 flex-row items-center justify-center gap-2"
            >
              <Feather
                name="arrow-left"
                size={16}
                color={twColor("text-primary")}
              />
              <Text className="text-center text-primary font-semibold">
                Back to identifier
              </Text>
            </Pressable>
          )}

          <View className="flex-row justify-center items-center gap-3 mt-3">
            <Text>Remember your password?</Text>
            <Link
              href="/auth/login"
              className="text-primary font-bold underline"
            >
              Sign in
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
