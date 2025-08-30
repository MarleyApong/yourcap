import { Stack } from "expo-router"
import { StatusBar } from "react-native"

export default function AuthLayout() {
  return (
    <>
      <StatusBar hidden />
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  )
}
