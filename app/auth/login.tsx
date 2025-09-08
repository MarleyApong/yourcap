import { FBackButton } from "@/components/ui/fback-button"
import PinInput from "@/components/ui/pin-input"
import { useTwColors } from "@/lib/tw-colors"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Image, Platform, Text, TextInput, TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Loader } from "@/components/ui/loader"

export default function Login() {
  const { login, loginWithBiometric, biometricCapabilities, checkBiometricCapabilities } = useAuthStore()
  const { twColor } = useTwColors()
  const identifierRef = useRef<TextInput>(null)
  const router = useRouter()

  // State
  const [identifier, setIdentifier] = useState("")
  const [showPinInput, setShowPinInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pinKey, setPinKey] = useState(0) // 👈 reset PinInput si erreur

  useEffect(() => {
    checkBiometricCapabilities()
  }, [])

  const handleIdentifierSubmit = () => {
    if (!identifier) {
      Alert.error("Please enter your email or phone number")
      return
    }

    if (identifier.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      Alert.error("Please enter a valid email address")
      return
    }

    if (!identifier.includes("@") && !/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(identifier)) {
      Alert.error("Please enter a valid Cameroonian phone number")
      return
    }

    setShowPinInput(true)
  }

  const handlePinComplete = async (pin: string) => {
    setLoading(true)
    try {
      const success = await login({ identifier, pin })
      if (success) {
        router.replace("/(tabs)/dashboard")
        Alert.success("Welcome!")
      } else {
        Alert.error("Invalid credentials. Please try again.")
        setPinKey((prev) => prev + 1)
      }
    } catch (err) {
      Alert.error("An unexpected error occurred. Please try again later.")
      setPinKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometric = async () => {
    setLoading(true)
    try {
      const success = await loginWithBiometric()
      if (success) {
        router.replace("/(tabs)/dashboard")
        Alert.success("Welcome!")
      } else {
        Alert.error("Biometric authentication failed")
      }
    } catch (err) {
      Alert.error("Biometric authentication error")
    } finally {
      setLoading(false)
    }
  }

  if (showPinInput) {
    return (
      <View className="flex-1 bg-primary-50">
        <FBackButton onPress={() => setShowPinInput(false)} />
        <PinInput
          key={`pin-${pinKey}`}
          title="Enter PIN"
          subtitle="Enter your 6-digit PIN to continue"
          onComplete={handlePinComplete}
          onBiometric={handleBiometric}
          biometricAvailable={biometricCapabilities?.isAvailable}
          showBiometric={true}
        />

        {loading && (
          <View className="absolute inset-0 bg-black/30 flex-1 justify-center items-center">
            <View className="bg-primary rounded-xl p-6 items-center">
              <Loader />
              <Text className="mt-4 text-white">Verifying...</Text>
            </View>
          </View>
        )}
      </View>
    )
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
            <Text className="text-2xl">Enter your credentials</Text>

            <View className="w-full mt-8 flex-col gap-4">
              <View className="bg-primary-50 border border-primary rounded-md flex-row gap-2 items-center px-3 py-1">
                <Feather name="mail" size={24} color={twColor("text-primary")} />
                <TextInput
                  ref={identifierRef}
                  className="text-xl flex-1"
                  placeholder="Email or Phone Number"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="default"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleIdentifierSubmit}
                />
              </View>
            </View>

            {/* Bouton pour soumettre l'identifiant */}
            <View className="w-full px-10 pb-8 mt-8">
              <TouchableOpacity
                onPress={handleIdentifierSubmit}
                disabled={loading}
                className={`flex-row gap-2 justify-center items-center bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}
              >
                <Text className="text-center text-white font-semibold text-lg">Continue</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center gap-3 mt-3">
                <Text>Don't have an account?</Text>
                <Link href="/auth/register" className="text-primary font-bold underline">
                  Sign up
                </Link>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}
