import { useAuth } from "@/hooks/useAuth"
import { Link, useFocusEffect, useRouter } from "expo-router"
import { Dimensions, ImageBackground, Text, View } from "react-native"
import { useEffect } from "react"

const { height: screenHeight } = Dimensions.get("window")

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/dashboard")
    }
  }, [user, loading])

  if (loading || user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ImageBackground source={require("@/assets/images/bg/welcome.jpg")} className="flex-1 justify-center items-center" resizeMode="cover">
      <View className="absolute inset-0 bg-black/60" />
      <View style={{ height: screenHeight - 400 }} className="w-full justify-between">
        <Text className="px-10 text-white text-6xl font-bold">Never forget who owes you again</Text>
        <View className="w-full px-10" style={{ position: "absolute", bottom: 0 }}>
          <Link href="/auth/login" className="bg-white/20 p-4 rounded-xl w-full">
            <Text className="text-center text-white font-semibold text-lg">Sign in</Text>
          </Link>
          <Link href="/auth/register" className="w-full mt-4">
            <Text className="text-center text-white font-semibold text-lg">Create an account</Text>
          </Link>
        </View>
      </View>
    </ImageBackground>
  )
}
