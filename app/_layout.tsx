import { Stack } from "expo-router"
import "../global.css"
import { useAuth } from "@/hooks/useAuth"

export default function RootLayout() {
  const { user } = useAuth()

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false
        }}
      />
      {user ? (
        <>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="debt/add"
            options={{
              title: "Add Debt",
              headerBackTitle: "Back" // Pour iOS
            }}
          />
          <Stack.Screen
            name="debt/[id]"
            options={{
              title: "Debt Details",
              headerBackTitle: "Back"
            }}
          />
        </>
      ) : null}
    </Stack>
  )
}