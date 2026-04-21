import { useTheme } from "@/core/theme"
import { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useTranslation } from "@/i18n"
import { getUserIdentifier } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { Redirect, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Index() {
  useAppStartup()
  const { t } = useTranslation()
  const { user, isInitialized, sessionExpired } = useAuthStore()
  const { colors } = useTheme()
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const insets = useSafeAreaInsets()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) return
    if (user) return
    getUserIdentifier().then((id) => setHasAccount(!!id))
  }, [isInitialized, user])

  if (user) return <Redirect href="/(tabs)/dashboard" />

  if (!isInitialized || hasAccount === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    )
  }

  // Existing users skip the onboarding flow entirely
  if (sessionExpired || hasAccount) {
    return <Redirect href="/auth/login" />
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg/welcome.jpg")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={5}
    >
      <View style={styles.overlay} />

      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
        <Image
          source={require("@/assets/images/logo/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t("welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
        </View>

        <Pressable
          onPress={() => router.replace("/auth/language")}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{t("welcome.getStarted")}</Text>
          <Feather name="arrow-right" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  logo: { width: 64, height: 64, borderRadius: 14 },
  titleBlock: { flex: 1, justifyContent: "flex-end", paddingBottom: 32 },
  title: { color: "#ffffff", fontSize: 48, fontWeight: "700", lineHeight: 60 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 16, marginTop: 16, lineHeight: 26 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
})
