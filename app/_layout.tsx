import { Stack } from "expo-router"
import useInactivityTimeout from "@/hooks/useInactivityTimeout"
import "react-native-get-random-values"
import "../global.css"

export default function RootLayout() {
  useInactivityTimeout()

  return (
    <Stack>
      {/* Écran index sans header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Auth sans header */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />

      {/* Tabs avec header CACHÉ */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          // Option cruciale pour iOS :
        }}
      />

      {/* Écrans de dettes avec header VISIBLE */}
      <Stack.Screen
        name="debt/add"
        options={{
          title: "New debt",
          headerBackTitle: "Back",
          // Force un header cohérent :
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
