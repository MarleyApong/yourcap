import { PasswordInput } from "@/components/ui/password-input"
import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { Image, Text, TextInput, View } from "react-native"

export default function Login() {
  return (
    <View>
      <Image source={require("@/assets/images/bg/bg-login.png")} className="h-90" resizeMode="cover" />
      <View className="flex items-center w-full px-8">
        <Text className="text-5xl text-green-800 font-bold">Welcome Back</Text>
        <Text className="text-xl">Login to your account</Text>

        <View className="w-full mt-8 flex-col gap-4">
          <View className="bg-green-800/10 rounded-md flex-row gap-2 items-center px-2">
            <Feather name="user" size={24} color="green" />
            <TextInput className="text-xl flex-1" autoCapitalize="words" autoCorrect={false} autoFocus placeholder="Full name" />
          </View>
          <View className="bg-green-800/10 rounded-md flex-row gap-2 items-center px-2">
            <Feather name="lock" size={24} color="green" />
            <PasswordInput className="text-xl" />
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              
            </View>
            <Link href="/auth/forgot-password" className="text-green-800">
              Forgot password ?
            </Link>
          </View>
        </View>
      </View>
    </View>
  )
}
