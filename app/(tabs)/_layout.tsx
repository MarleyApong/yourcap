import { Tabs } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTwColors } from "@/lib/tw-colors"

export default function TabsLayout() {
  const { twColor } = useTwColors()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: twColor("text-primary"),
        tabBarInactiveTintColor: twColor("text-gray-500"),
        tabBarStyle: {
          backgroundColor: twColor("bg-white"),
          borderTopWidth: 1,
          borderTopColor: twColor("border-gray-200"),
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
