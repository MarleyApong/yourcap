import { initDb } from "@/db/db"
import { useAuth } from "@/hooks/useAuth"
import * as FileSystem from "expo-file-system"
import { Stack } from "expo-router"
import { useEffect } from "react"
import "react-native-get-random-values"
import Toast from 'react-native-toast-message'
import "../global.css"

export default function RootLayout() {
  const { user } = useAuth()

  useEffect(() => {
    initDb()
  }, [])
  console.log("📂 DB path:", FileSystem.documentDirectory + "SQLite/debt_app.db")


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
            name="debt/add"
            options={{
              title: "Add Debt",
              headerBackTitle: "Back", // Pour iOS
            }}
          />
          <Stack.Screen
            name="debt/[id]"
            options={{
              title: "Debt Details",
              headerBackTitle: "Back",
            }}
          />
        </>
      ) : null}
      <Toast position="bottom"/>
    </Stack>
  )
}
