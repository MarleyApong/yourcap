import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { Link, useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { TextInput } from "@/components/ui/text-input"
import { FBackButton } from "@/components/ui/fback-button"
import { useTwColors } from "@/lib/tw-colors"
import Toast from "react-native-toast-message"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"request" | "verify" | "reset">("request")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { twColor } = useTwColors()

  const handleRequestCode = () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email address",
      })
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep("verify")
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Verification code sent to your email",
      })
    }, 1500)
  }

  const handleVerifyCode = () => {
    if (!code) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the verification code",
      })
      return
    }

    setStep("reset")
  }

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter and confirm your new password",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      })
      return
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      })
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password reset successfully!",
      })
      router.replace("/auth/login")
    }, 1500)
  }

  return (
    <View className="flex-1 bg-white">
      <FBackButton />

      <View className="px-8 mt-20">
        <Text className="text-3xl font-bold text-gray-900 mb-2">{step === "request" ? "Forgot Password" : step === "verify" ? "Verify Code" : "Reset Password"}</Text>
        <Text className="text-gray-500 mb-8">
          {step === "request" ? "Enter your email to receive a verification code" : step === "verify" ? "Enter the code sent to your email" : "Enter your new password"}
        </Text>

        {step === "request" ? (
          <View className="space-y-6">
            <TextInput label="Email Address" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" icon="mail" />

            <Pressable onPress={handleRequestCode} disabled={loading} className={`bg-primary p-4 rounded-xl ${loading ? "opacity-70" : ""}`}>
              <Text className="text-center text-white font-semibold text-lg">{loading ? "Sending..." : "Send Verification Code"}</Text>
            </Pressable>
          </View>
        ) : step === "verify" ? (
          <View className="space-y-6">
            <TextInput label="Verification Code" placeholder="Enter 6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" icon="lock" />

            <Pressable onPress={handleVerifyCode} disabled={loading} className={`bg-primary p-4 rounded-xl ${loading ? "opacity-70" : ""}`}>
              <Text className="text-center text-white font-semibold text-lg">{loading ? "Verifying..." : "Verify Code"}</Text>
            </Pressable>

            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500">Didn't receive code?</Text>
              <Pressable onPress={handleRequestCode} className="ml-2">
                <Text className="text-primary font-semibold">Resend</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="space-y-6">
            <TextInput label="New Password" placeholder="At least 6 characters" value={newPassword} onChangeText={setNewPassword} secureTextEntry icon="lock" />

            <TextInput label="Confirm New Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry icon="lock" />

            <Pressable onPress={handleResetPassword} disabled={loading} className={`bg-primary p-4 rounded-xl ${loading ? "opacity-70" : ""}`}>
              <Text className="text-center text-white font-semibold text-lg">{loading ? "Resetting..." : "Reset Password"}</Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">Remember your password?</Text>
          <Link href="/auth/login" className="ml-2 text-primary font-semibold">
            Sign In
          </Link>
        </View>
      </View>
    </View>
  )
}
