import { useTheme } from "@/core/theme"
import { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useTranslation } from "@/i18n"
import { SupportedLanguage, supportedLanguages } from "@/i18n/locales"
import { getUserIdentifier } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useLanguageStore } from "@/stores/languageStore"
import { Link, Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Index() {
  useAppStartup()
  const { t } = useTranslation()
  const { user, isInitialized, sessionExpired } = useAuthStore()
  const { colors } = useTheme()
  const { guestLanguage, setGuestLanguage, loadGuestLanguage } = useLanguageStore()
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    loadGuestLanguage()
  }, [])

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

  if (sessionExpired || hasAccount) {
    return <Redirect href="/auth/login" />
  }

  const currentLang = supportedLanguages[guestLanguage]

  return (
    <ImageBackground
      source={require("@/assets/images/bg/welcome.jpg")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={5}
    >
      <View style={styles.overlay} />

      <View style={[styles.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      {dropdownOpen && (
        <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 9 }]} onPress={() => setDropdownOpen(false)} />
      )}

        {/* Sélecteur de langue — dropdown inline */}
        <View style={styles.langRow}>
          <Pressable
            onPress={() => setDropdownOpen((v) => !v)}
            style={styles.langTrigger}
          >
            <Text style={styles.langFlag}>{currentLang.flag}</Text>
            <Text style={styles.langCode}>{guestLanguage.toUpperCase()}</Text>
            <Text style={styles.langChevron}>{dropdownOpen ? "▴" : "▾"}</Text>
          </Pressable>

          {dropdownOpen && (
            <View style={styles.dropdown}>
              {Object.entries(supportedLanguages).map(([key, config]) => {
                const lang = key as SupportedLanguage
                const isSelected = lang === guestLanguage
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setGuestLanguage(lang)
                      setDropdownOpen(false)
                    }}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  >
                    <Text style={styles.langFlag}>{config.flag}</Text>
                    <Text style={[styles.dropdownLabel, isSelected && styles.dropdownLabelActive]}>
                      {config.name}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        {/* Titre centré */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t("welcome.title")}</Text>
          <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
        </View>

        {/* Boutons en bas */}
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
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },

  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },

  langRow: { alignItems: "flex-end", zIndex: 10, position: "relative" },
  langTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  langFlag: { fontSize: 15 },
  langCode: { fontSize: 11, fontWeight: "700", color: "#ffffff", letterSpacing: 0.5 },
  langChevron: { fontSize: 10, color: "rgba(255,255,255,0.7)" },

  titleBlock: { flex: 1, justifyContent: "flex-start", paddingHorizontal: 12, paddingTop: 60 },
  title: { color: "#ffffff", fontSize: 56, fontWeight: "700", lineHeight: 72 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginTop: 20, lineHeight: 26 },

  buttons: { gap: 12 },
  loginBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  registerBtn: { width: "100%" },
  btnText: { textAlign: "center", color: "#ffffff", fontWeight: "600", fontSize: 16 },

  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    backgroundColor: "rgba(20,20,30,0.97)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    minWidth: 180,
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dropdownLabel: { flex: 1, fontSize: 14, color: "rgba(255,255,255,0.75)" },
  dropdownLabelActive: { color: "#ffffff", fontWeight: "600" },
  checkmark: { fontSize: 12, color: "#ffffff" },
})
