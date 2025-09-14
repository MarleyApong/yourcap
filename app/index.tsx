import { Dimensions, ImageBackground, Text, View } from "react-native"
import { Link } from "expo-router"

const { height: screenHeight } = Dimensions.get("window")

export default function Index() {
  return (
    <ImageBackground source={require("@/assets/images/bg/welcome.jpg")} className="flex-1 justify-center items-center" resizeMode="cover">
      {/* Overlay sombre */}
      <View className="absolute inset-0 bg-black/60" />

      <View style={{ height: screenHeight - 400 }} className="w-full justify-between">
        {/* Titre + sous-titre */}
        <View className="px-10">
          <Text className="text-white text-6xl font-bold leading-tight">Never forget who owes you again</Text>
          <Text className="text-white/80 text-lg mt-4">Keep track of debts easily and securely.</Text>
        </View>

        {/* Boutons */}
        <View className="w-full px-10" style={{ position: "absolute", bottom: 0 }}>
          <Link href="/auth/login" className="bg-white/20 p-4 rounded-xl w-full mb-4">
            <Text className="text-center text-white font-semibold text-lg">Sign in</Text>
          </Link>
          <Link href="/auth/register" className="w-full">
            <Text className="text-center text-white font-semibold text-lg">Create an account</Text>
          </Link>
        </View>
      </View>
    </ImageBackground>
  )
}
