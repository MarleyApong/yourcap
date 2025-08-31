import { useRef, useState } from "react"
import { TextInput, TouchableOpacity, View, Text, Image, Platform } from "react-native"
import { Checkbox } from "@/components/ui/checkbox"
import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Loader } from "@/components/ui/loader"

export default function Login() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordRef = useRef<TextInput>(null)

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

    setLoading(true)
    try {
      const success = await login({ identifier, password })
      if (success) {
        router.replace("/(tabs)/dashboard")
      } else {
        console.log("jjjjj")

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
    <View className="flex-1 bg-primary-50">
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <FBackButton path="/" />

        <View className="relative">
          <Image source={require("@/assets/images/bg/bg-login-2.png")} className="h-90 w-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/60" />
        </View>

        <View className="flex-1 justify-between">
          <View className="flex items-center w-full px-8 mt-10">
            <Text className="text-5xl text-primary font-bold">Welcome Back</Text>
            <Text className="text-2xl">Login to your account</Text>

            <View className="w-full mt-8 flex-col gap-4">
              <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
                <Feather name="mail" size={24} color={twColor("text-primary")} />
                <TextInput
                  className="text-xl flex-1"
                  placeholder="Email"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              {/* Champ Password */}
              <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
                <Feather name="lock" size={24} color={twColor("text-primary")} />
                <PasswordInput
                  ref={passwordRef}
                  className="text-xl flex-1"
                  value={password}
                  onChangeText={setPassword}
                  iconColor={twColor("text-primary")}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Checkbox label="Remember me" checked={agreed} onChange={setAgreed} />
                <Link href="/auth/forgot-password" className="text-primary font-bold">
                  Forgot password?
                </Link>
              </View>
            </View>
          </View>

          {/* Bouton */}
          <View className="w-full px-10 pb-8">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}
            >
              {loading ? <Loader /> : <Feather name="log-in" size={18} color={twColor("text-white")} />}
              <Text className="text-center text-white font-semibold text-lg">{loading ? "Signing in..." : "Sign in"}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-3 mt-3">
              <Text>Don't have an account?</Text>
              <Link href="/auth/register" className="text-primary font-bold underline">
                Sign up
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}
