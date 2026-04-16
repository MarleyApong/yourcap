import { useTheme } from "@/core/theme"
import { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useTranslation } from "@/i18n"
import { SupportedLanguage, supportedLanguages } from "@/i18n/locales"
import { useAuthStore } from "@/stores/authStore"
import { useLanguageStore } from "@/stores/languageStore"
import { Link, Redirect } from "expo-router"
import { useEffect } from "react"
import { Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native"

const { height: screenHeight } = Dimensions.get("window")

export default function Index() {
  useAppStartup()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { colors } = useTheme()
  const { guestLanguage, setGuestLanguage, loadGuestLanguage } = useLanguageStore()

  useEffect(() => {
    loadGuestLanguage()
  }, [])

  if (user) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg/welcome.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Sélecteur de langue en haut à droite */}
      <View style={styles.langBar}>
        {Object.entries(supportedLanguages).map(([key, config]) => {
          const lang = key as SupportedLanguage
          const isSelected = lang === guestLanguage
          return (
            <Pressable
              key={key}
              onPress={() => setGuestLanguage(lang)}
              style={[
                styles.langBtn,
                {
                  backgroundColor: isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  borderColor: isSelected ? "#ffffff" : "rgba(255,255,255,0.3)",
                },
              ]}
            >
              <Text style={styles.langFlag}>{config.flag}</Text>
              <Text
                style={[
                  styles.langCode,
                  { color: isSelected ? "#000000" : "rgba(255,255,255,0.85)" },
                ]}
              >
                {key.toUpperCase()}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View style={[styles.inner, { height: screenHeight - 400 }]}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t("welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
        </View>

        <View style={styles.buttons}>
          <Link href="/auth/login" style={styles.loginBtn}>
            <Text style={styles.btnText}>{t("welcome.signIn")}</Text>
          </Link>
          <Link href="/auth/register" style={styles.registerBtn}>
            <Text style={styles.btnText}>{t("welcome.createAccount")}</Text>
          </Link>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },

  langBar: {
    position: "absolute",
    top: 56,
    right: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
    maxWidth: 220,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  langFlag: { fontSize: 14 },
  langCode: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  inner: { width: "100%", justifyContent: "space-between" },
  titleBlock: { paddingHorizontal: 40 },
  title: { color: "#ffffff", fontSize: 60, fontWeight: "700", lineHeight: 72 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 18, marginTop: 16 },
  buttons: { width: "100%", paddingHorizontal: 40, position: "absolute", bottom: 0 },
  loginBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
  },
  registerBtn: { width: "100%" },
  btnText: { textAlign: "center", color: "#ffffff", fontWeight: "600", fontSize: 18 },
})
