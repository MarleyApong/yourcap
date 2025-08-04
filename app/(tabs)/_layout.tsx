import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {
  const { twColor } = useTwColors()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: twColor("primary"),
        tabBarInactiveTintColor: twColor("gray-500"),
        tabBarStyle: {
          backgroundColor: twColor("white"),
          borderTopWidth: 1,
          borderTopColor: twColor("gray-200"),
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitle: "Dashboard",
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <Feather name="list" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
