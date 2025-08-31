import { FBackButton } from "@/components/ui/fback-button"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Pressable, Text, TextInput, View, Platform } from "react-native"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { PasswordInput } from "@/components/ui/password-input"

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const { twColor } = useTwColors()
  const { register } = useAuth()
  const router = useRouter()

  // Refs pour navigation entre inputs
  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const passwordRef = useRef<any>(null)
  const confirmPasswordRef = useRef<any>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.full_name || !formData.email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Full name and email are required",
      })
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid email address",
      })
      return false
    }

    if (formData.phone_number && !/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.phone_number)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid Cameroonian phone number",
      })
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (formData.password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text2: "Passwords do not match",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setLoading(true)
    try {
      const success = await register(formData)
      if (success) router.replace("/(tabs)/dashboard")
    } catch (error) {
  console.log("error", error);
  
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Registration failed. Please try again.",
      })
    } finally {
      setLoading(false)
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
          <Pressable onPress={() => setStep(1)} className="flex-row items-center justify-center p-2 bg-background/20 border border-primary rounded-full">
            <Feather name="chevron-left" size={24} color={twColor("primary")} />
          </Pressable>
        </View>
      )}

      <View className="flex items-center justify-center h-screen w-full px-8">
        <Text className="text-5xl text-primary font-bold">Register</Text>
        <Text className="text-2xl">Create your account</Text>

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
              <TextInput
                className="text-xl flex-1"
                placeholder="Full name"
                value={formData.full_name}
                onChangeText={(text) => handleChange("full_name", text)}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            {/* Email */}
            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="mail" size={24} color={twColor("text-primary")} />
              <TextInput
                ref={emailRef}
                className="text-xl flex-1"
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            {/* Phone number */}
            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="phone" size={24} color={twColor("text-primary")} />
              <TextInput
                ref={phoneRef}
                className="text-xl flex-1"
                placeholder="6xx xxx xxx or 2xx xxx xxx"
                value={formData.phone_number}
                onChangeText={(text) => handleChange("phone_number", text)}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
        ) : (
          <View className="w-full mt-4 flex-col gap-4">
            {/* Password */}
            <View className="bg-primary-50 border border-primary rounded-lg flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                ref={passwordRef}
                className="text-xl flex-1"
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
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
                placeholder="Confirm Password"
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
          <Pressable onPress={step === 1 ? handleContinue : handleSubmit} disabled={loading} className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}>
            {step === 1 ? <Feather name="arrow-up-right" size={24} color={twColor("text-white")} /> :  <Feather name="send" size={24} color={twColor("text-white")} />}
            <Text className="text-center text-white font-semibold text-lg">{loading ? "Processing..." : step === 1 ? "Continue" : "Sign up"}</Text>
          </Pressable>

          {step === 2 && (
            <Pressable onPress={() => setStep(1)} className="mt-4 flex-row items-center justify-center gap-2">
              <Feather name="arrow-left" size={16} color={twColor("text-primary")} />
              <Text className="text-center text-primary font-semibold">Back to personal info</Text>
            </Pressable>
          )}

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
