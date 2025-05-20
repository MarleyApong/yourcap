import { Stack } from "expo-router"
// import "react-native-gesture-handler"
import "../global.css"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          // title: "Accueil",
          // headerStyle: { backgroundColor: "#1e1e1e" },
          // headerTintColor: "#fff",
          // headerTitleAlign: "center",
          // presentation: "formSheet",
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          presentation: "containedModal",
          title: "Modale",
        }}
      />
    </Stack>
  )
}
