import { useTheme } from "@/core/theme"
import { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useTranslation } from "@/i18n"
import { SupportedLanguage, supportedLanguages } from "@/i18n/locales"
import { getUserIdentifier } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useLanguageStore } from "@/stores/languageStore"
import { Feather } from "@expo/vector-icons"
import * as Localization from "expo-localization"
import { Redirect, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SUPPORTED_CODES = Object.keys(supportedLanguages) as SupportedLanguage[]

function detectSystemLanguage(): SupportedLanguage {
  const locales = Localization.getLocales()
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase()
    if (code && SUPPORTED_CODES.includes(code as SupportedLanguage)) {
      return code as SupportedLanguage
    }
  }
  return "en"
}

export default function Index() {
  useAppStartup()
  const { t } = useTranslation()
  const { user, isInitialized, sessionExpired } = useAuthStore()
  const { colors } = useTheme()
  const { setAppLanguage } = useLanguageStore()
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const insets = useSafeAreaInsets()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) return
    if (user) return
    getUserIdentifier().then((id) => setHasAccount(!!id))
  }, [isInitialized, user])

  // Detect and apply system language as soon as welcome mounts (new users only)
  useEffect(() => {
    if (!isInitialized || user || hasAccount) return
    setAppLanguage(detectSystemLanguage())
  }, [isInitialized, user, hasAccount])

  if (user) return <Redirect href="/(tabs)/dashboard" />

  if (!isInitialized || hasAccount === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    )
  }

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

        {/* Logo + nom en haut */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>YourCap</Text>
        </View>

        {/* Titre centré verticalement */}
        <View style={styles.center}>
          <Text style={styles.title}>{t("welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
        </View>

        {/* Bouton en bas */}
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.52)" },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 40, height: 40, borderRadius: 10 },
  appName: { color: "#ffffff", fontWeight: "700", fontSize: 18, letterSpacing: 0.3 },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  title: { color: "#ffffff", fontSize: 42, fontWeight: "700", lineHeight: 52 },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: 16, marginTop: 14, lineHeight: 26 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
})
