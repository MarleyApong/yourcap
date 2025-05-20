import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          // tabBarIcon: ({ color }) => <Home name="home" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
