import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Tabs, useRouter } from "expo-router"
import { Pressable, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const TabIcon = ({ focused, iconName, title }: { focused: boolean; iconName: string; title: string }) => {
  const { twColor } = useTwColors()

  if (focused) {
    return (
      <View
        style={{
          backgroundColor: twColor("navigation-active-background"), // Active nav background
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 30,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
          minHeight: 65,
          shadowColor: twColor("navigation-shadow"), // Navigation shadow
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <Feather
          name={iconName as any}
          size={22}
          color={twColor("navigation-active-foreground")} // Active icon color
        />
        <Text
          style={{
            color: twColor("navigation-active-foreground"), // Active text color
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </View>
    )
  }

  return (
    <View>
      <Feather
        name={iconName as any}
        size={24}
        color={twColor("navigation-inactive-foreground")} // Inactive icon color
      />
      {/* <Text
        style={{
          color: twColor("navigation-inactive-foreground"), // Inactive text color
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
          opacity: 0.7,
        }}
      >
        {title}
      </Text> */}
    </View>
  )
}

export default function TabsLayout() {
  const { twColor } = useTwColors()
  const router = useRouter()

  return (
    <>
      {/* Status bar matches background */}
      <StatusBar barStyle="dark-content" backgroundColor={twColor("background")} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: twColor("background"), // Main background
        }}
      >
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: {
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 18,
            },
            tabBarStyle: {
              backgroundColor: twColor("navigation-background"), // Navigation background
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 8,
              height: 72,
              position: "absolute",
              overflow: "visible", // Allow shadows to be visible
              borderWidth: 1,
              borderColor: twColor("navigation-border"), // Navigation border
              shadowColor: twColor("navigation-shadow"), // Navigation shadow
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 10,
            },
            tabBarActiveTintColor: twColor("navigation-active-foreground"),
            tabBarInactiveTintColor: twColor("navigation-inactive-foreground"),
            // Header styles for consistency
            headerStyle: {
              backgroundColor: twColor("header-background"),
              shadowColor: twColor("header-shadow"),
            },
            headerTintColor: twColor("header-foreground"),
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="home" title="Accueil" />,
              headerShown: false, // Hide header for dashboard
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: "Historique",
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="list" title="Historique" />,
              headerLeft: (props) => (
                <Pressable onPress={() => router.back()} style={{ paddingLeft: 15 }}>
                  <Feather name="arrow-left" size={24} color={twColor("header-foreground")} />
                </Pressable>
              ),
              headerStyle: {
                backgroundColor: twColor("header-background"),
                borderBottomWidth: 1,
                borderBottomColor: twColor("header-border"),
              },
              headerTitleStyle: {
                color: twColor("header-foreground"),
                fontWeight: "600",
              },
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Paramètres",
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="settings" title="Paramètres" />,
              headerStyle: {
                backgroundColor: twColor("header-background"),
                borderBottomWidth: 1,
                borderBottomColor: twColor("header-border"),
              },
              headerTitleStyle: {
                color: twColor("header-foreground"),
                fontWeight: "600",
              },
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  )
}