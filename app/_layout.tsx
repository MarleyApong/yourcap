import { Stack } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import "../global.css"

export default function RootLayout() {
  const { user } = useAuth()

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
      {user ? (
        <>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-debt"
            options={{
              title: "Add Debt",
            }}
          />
          <Stack.Screen
            name="debt-details/[id]"
            options={{
              title: "Debt Details",
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: "History",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
        </>
      ) : null}
    </Stack>
  )
}
