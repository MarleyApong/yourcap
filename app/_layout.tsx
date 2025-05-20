import { Stack } from "expo-router"
// import "react-native-gesture-handler"
import "../global.css"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}
