import { Checkbox } from "@/components/ui/checkbox"
import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { Image, Pressable, Text, TextInput, View } from "react-native"
import Toast from "react-native-toast-message"

export default function Login() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { twColor } = useTwColors()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!identifier || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both identifier and password",
      })
      return
    }
    router.replace("/(tabs)/dashboard")

    setLoading(true)
    try {
      const success = await login({ identifier, password })
      if (success) {
        router.replace("/(tabs)/dashboard")
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Login failed. Please check your credentials.",
        })
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="relative h-full bg-primary-50">
      <FBackButton />
      <Image source={require("@/assets/images/bg/bg-login-2.png")} className="h-90 w-full" resizeMode="cover" />

      <View className="flex items-center w-full px-8 mt-10">
        <Text className="text-5xl text-primary font-bold">Welcome Back</Text>
        <Text className="text-2xl">Login to your account</Text>

        <View className="w-full mt-8 flex-col gap-4">
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="mail" size={24} color={twColor("text-primary")} />
            <TextInput className="text-xl flex-1" placeholder="Email" value={identifier} onChangeText={setIdentifier} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="lock" size={24} color={twColor("text-primary")} />
            <PasswordInput className="text-xl" value={password} onChangeText={setPassword} iconColor={twColor("text-primary")} />
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Checkbox label="Remember me" checked={agreed} onChange={setAgreed} />
            </View>
            <Link href="/auth/forgot-password" className="text-primary font-bold">
              Forgot password?
            </Link>
          </View>
        </View>
      </View>
      <View className="w-full px-10 absolute bottom-14">
        <Pressable onPress={handleSubmit} disabled={loading} className={`bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}>
          <Text className="text-center text-white font-semibold text-lg">{loading ? "Signing in..." : "Sign in"}</Text>
        </Pressable>
        <View className="flex-row justify-center items-center gap-3 mt-3">
          <Text>Don't have an account?</Text>
          <Link href="/auth/register" className="text-primary font-bold underline">
            Sign up
          </Link>
        </View>
      </View>
    </View>
  )
}
