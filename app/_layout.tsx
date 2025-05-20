import { Stack } from "expo-router"
import "react-native-gesture-handler"
import "../global.css"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Accueil",
          headerStyle: { backgroundColor: "#1e1e1e" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Modale",
        }}
      />
    </Stack>
  )
}
