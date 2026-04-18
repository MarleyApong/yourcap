import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { isSessionValid } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { Tabs, useRouter } from "expo-router"
import { useEffect } from "react"
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const TabIcon = ({ focused, iconName, title }: { focused: boolean; iconName: string; title: string }) => {
  const { colors } = useTheme()

  if (focused) {
    return (
      <View
        style={{
          backgroundColor: colors.navigation.activeBackground,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 30,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
          minHeight: 65,
          shadowColor: colors.navigation.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <Feather name={iconName as any} size={22} color={colors.navigation.activeForeground} />
        <Text
          style={{
            color: colors.navigation.activeForeground,
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
      <Feather name={iconName as any} size={24} color={colors.navigation.inactiveForeground} />
    </View>
  )
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { user, markSessionExpired } = useAuthStore()

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
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
              backgroundColor: "transparent",
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 8,
              height: 72,
              position: "absolute",
              overflow: "visible",
              borderWidth: 1,
              borderColor: colors.navigation.border,
              shadowColor: colors.navigation.shadow,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 10,
            },
            tabBarBackground: () =>
              Platform.OS === "ios" ? (
                <BlurView
                  intensity={60}
                  tint={isDark ? "dark" : "light"}
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: 16, overflow: "hidden", backgroundColor: colors.navigation.background + "99" },
                  ]}
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: 16, overflow: "hidden", backgroundColor: colors.navigation.background },
                  ]}
                />
              ),
            tabBarActiveTintColor: colors.navigation.activeForeground,
            tabBarInactiveTintColor: colors.navigation.inactiveForeground,
            headerStyle: {
              backgroundColor: colors.header.background,
            },
            headerTintColor: colors.header.foreground,
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
