import { useTranslation } from "@/i18n"
import { isSessionValid } from "@/lib/auth"
import { useTwColors } from "@/lib/tw-colors"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Tabs, useRouter } from "expo-router"
import { useEffect } from "react"
import { StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const TabIcon = ({ focused, iconName, title }: { focused: boolean; iconName: string; title: string }) => {
  const { twColor } = useTwColors()

  if (focused) {
    return (
      <View
        style={{
          backgroundColor: twColor("navigation-active-background"),
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 30,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
          minHeight: 65,
          shadowColor: twColor("navigation-shadow"),
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <Feather name={iconName as any} size={22} color={twColor("navigation-active-foreground")} />
        <Text
          style={{
            color: twColor("navigation-active-foreground"),
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
      <Feather name={iconName as any} size={24} color={twColor("navigation-inactive-foreground")} />
    </View>
  )
}

export default function TabsLayout() {
  const { twColor } = useTwColors()
  const { t } = useTranslation()
  const router = useRouter()
  const { user, markSessionExpired } = useAuthStore()

  // Vérifier la session à chaque focus des tabs
  useEffect(() => {
    const checkSession = async () => {
      if (!user) return

      const isValid = await isSessionValid()
      // if (!isValid) {
      //   markSessionExpired()
      //   router.replace("/auth/login")
      // }
    }

    checkSession()
  }, [user])

  return (
    <>
      <StatusBar animated translucent barStyle="dark-content" />

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: twColor("background"),
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
              backgroundColor: twColor("navigation-background"),
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 8,
              height: 72,
              position: "absolute",
              overflow: "visible",
              borderWidth: 1,
              borderColor: twColor("navigation-border"),
              shadowColor: twColor("navigation-shadow"),
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
            headerStyle: {
              backgroundColor: twColor("header-background"),
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
            title: t("tabs.dashboard"),
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="home" title={t("tabs.dashboard")} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
            title: t("tabs.history"),
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="list" title={t("tabs.history")} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
            title: t("tabs.settings"),
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="settings" title={t("tabs.settings")} />,
              headerShown: false,
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  )
}
