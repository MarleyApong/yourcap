import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, Text, TextInput, View } from "react-native"
import Toast from "react-native-toast-message"

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.full_name || !formData.email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "First name, last name and email are required",
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
    <ScrollView className="h-full bg-primary-50" contentContainerStyle={{ flexGrow: 1 }}>
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
            {[
              { label: "Full name", icon: "user", field: "full_name" },
              { label: "Email", icon: "mail", field: "email", keyboardType: "email-address" },
              {
                label: "Phone number (optional)",
                icon: "phone",
                field: "phone_number",
                keyboardType: "phone-pad",
                placeholder: "6xx xxx xxx or 2xx xxx xxx",
              },
            ].map(({ label, icon, field, keyboardType, placeholder }) => (
              <View key={label} className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
                <Feather name={icon as any} size={24} color={twColor("text-primary")} />
                <TextInput
                  className="text-xl flex-1"
                  placeholder={placeholder || label}
                  value={formData[field as keyof typeof formData]}
                  onChangeText={(text) => handleChange(field, text)}
                  autoCapitalize={field === "email" ? "none" : "words"}
                  keyboardType={keyboardType as any}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="w-full mt-4 flex-col gap-4">
            <View className="bg-primary-50 border border-primary rounded-lg flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                className="text-xl"
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                iconColor={twColor("text-primary")}
              />
            </View>

            <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name="lock" size={24} color={twColor("text-primary")} />
              <PasswordInput
                className="text-xl"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                iconColor={twColor("text-primary")}
              />
            </View>
          </View>
        )}

        <View className="w-full px-10 mt-8 mb-10 absolute bottom-0">
          <Pressable onPress={step === 1 ? handleContinue : handleSubmit} disabled={loading} className={`bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}>
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

      <Toast />
    </ScrollView>
  )
}
