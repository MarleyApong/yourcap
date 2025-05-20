import { Drawer } from "expo-router/drawer"

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ drawerLabel: "Accueil", title: "Page d’accueil" }} />
    </Drawer>
  )
}
