import { useState } from "react"
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"

export default function Register() {
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [phone_number, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const { twColor } = useTwColors()
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!firstname || !lastname || !email || !phone_number || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const success = await register({
        firstname,
        lastname,
        email,
        phone_number,
        password,
        confirmPassword,
      })
      if (success) router.replace("/(tabs)/dashboard")
    } catch (error) {
      console.error("error", error)
      Alert.alert("Error", "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="h-full bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <FBackButton />
      <View className="flex items-center w-full px-8 mt-52">
        <Text className="text-5xl text-primary font-bold">Register</Text>
        <Text className="text-2xl">Create your account</Text>

        <View className="w-full mt-8 flex-col gap-4">
          {[
            { label: "First name", icon: "user", value: firstname, setter: setFirstname },
            { label: "Last name", icon: "user", value: lastname, setter: setLastname },
            { label: "Email", icon: "mail", value: email, setter: setEmail, keyboardType: "email-address" },
            { label: "Phone number", icon: "phone", value: phone_number, setter: setPhoneNumber, keyboardType: "phone-pad" },
          ].map(({ label, icon, value, setter, keyboardType }) => (
            <View key={label} className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
              <Feather name={icon as any} size={24} color={twColor("text-primary")} />
              <TextInput className="text-xl flex-1" placeholder={label} value={value} onChangeText={setter} autoCapitalize="none" keyboardType={keyboardType as any} />
            </View>
          ))}

          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="lock" size={24} color={twColor("text-primary")} />
            <PasswordInput className="text-xl" placeholder="Password" value={password} onChangeText={setPassword} iconColor={twColor("text-primary")} />
          </View>

          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="lock" size={24} color={twColor("text-primary")} />
            <PasswordInput className="text-xl" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} iconColor={twColor("text-primary")} />
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
    </ScrollView>
  )
}
