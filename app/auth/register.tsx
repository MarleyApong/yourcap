import { useState } from "react"
import { View, Text, TextInput, Pressable, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { twColor } = useTwColors()
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const success = await register({ name, email, password })
      if (success) {
        router.replace("/(tabs)/dashboard")
      }
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="relative h-full flex-col justify-center items-center">
      <FBackButton />
      <View className="flex items-center w-full px-8 mt-48">
        <Text className="text-5xl text-primary font-bold">Register</Text>
        <Text className="text-2xl">Create your account</Text>

        <View className="w-full mt-8 flex-col gap-4">
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="user" size={24} color={twColor("text-primary")} />
            <TextInput className="text-xl flex-1" placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
          </View>
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="mail" size={24} color={twColor("text-primary")} />
            <TextInput className="text-xl flex-1" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="lock" size={24} color={twColor("text-primary")} />
            <PasswordInput className="text-xl" placeholder="Password (min 6 characters)" value={password} onChangeText={setPassword} iconColor={twColor("text-primary")} />
          </View>
        </View>
      </View>
      <View className="w-full px-10 mt-8">
        <Pressable onPress={handleSubmit} disabled={loading} className={`bg-primary p-4 rounded-xl w-full ${loading ? "opacity-70" : ""}`}>
          <Text className="text-center text-white font-semibold text-lg">{loading ? "Creating account..." : "Sign up"}</Text>
        </Pressable>
        <View className="flex-row justify-center items-center gap-3 mt-3">
          <Text>Already have an account?</Text>
          <Link href="/auth/login" className="text-primary font-bold underline">
            Sign in
          </Link>
        </View>
      </View>
    </View>
  )
}
