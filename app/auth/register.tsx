import { Checkbox } from "@/components/ui/checkbox"
import { FBackButton } from "@/components/ui/fback-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { useState } from "react"
import { Text, TextInput, View } from "react-native"

export default function Register() {
  const [agreed, setAgreed] = useState(false)
  const { twColor } = useTwColors()

  return (
    <View className="relative h-full">
      <FBackButton />
      <View className="flex items-center w-full px-8 mt-48">
        <Text className="text-5xl text-primary font-bold">Register</Text>
        <Text className="text-2xl">Create your account</Text>

        <View className="w-full mt-8 flex-col gap-4">
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="user" size={24} color={twColor("text-primary")} />
            <TextInput className="text-xl flex-1" autoCapitalize="words" autoCorrect={false} placeholder="Full name" />
          </View>
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="user" size={24} color={twColor("text-primary")} />
            <TextInput className="text-xl flex-1" autoCapitalize="words" autoCorrect={false} placeholder="Full name" />
          </View>
          <View className="bg-primary/10 rounded-md flex-row gap-2 items-center px-3 py-1">
            <Feather name="lock" size={24} color={twColor("text-primary")} />
            <PasswordInput className="text-xl" iconColor={twColor("text-primary")} />
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Checkbox label="Remenber me" checked={agreed} onChange={setAgreed} />
            </View>
            <Link href="/auth/forgot-password" className="text-primary font-bold">
              Forgot password ?
            </Link>
          </View>
        </View>
      </View>
      <View className="w-full px-10 absolute bottom-14">
        <Link href="/auth/login" className="bg-primary p-4 rounded-xl w-full">
          <Text className="text-center text-white font-semibold text-lg">Sign in</Text>
        </Link>
        <View className="flex-row justify-center items-center gap-3 mt-3">
          <Text>Don't have a account ?</Text>
          <Link href="/auth/forgot-password" className="text-primary font-bold underline">
            Sign up
          </Link>
        </View>
      </View>
    </View>
  )
}
