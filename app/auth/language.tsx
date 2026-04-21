import { FBackButton } from "@/components/ui/fback-button"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { SupportedLanguage, supportedLanguages } from "@/i18n/locales"
import { useLanguageStore } from "@/stores/languageStore"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SUPPORTED_CODES = Object.keys(supportedLanguages) as SupportedLanguage[]

export default function LanguageScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { appLanguage, setAppLanguage } = useLanguageStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Pre-selected = whatever was detected on the welcome screen
  const [selected, setSelected] = useState<SupportedLanguage>(appLanguage)
  const autoDetected = appLanguage

  const handleContinue = async () => {
    await setAppLanguage(selected)
    router.replace("/auth/login")
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg/welcome.jpg")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={5}
    >
      <View style={styles.overlay} />

      <View style={[styles.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>

        <FBackButton path="/" isAbsolute={false} />

        <Image
          source={require("@/assets/images/logo/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t("welcome.chooseLanguage")}</Text>
          <Text style={styles.subtitle}>{t("welcome.chooseLanguageSubtitle")}</Text>
        </View>

        <View style={styles.list}>
          {SUPPORTED_CODES.map((code) => {
            const lang = supportedLanguages[code]
            const isSelected = code === selected
            const isDetected = code === autoDetected

            return (
              <Pressable
                key={code}
                onPress={() => setSelected(code)}
                style={[
                  styles.row,
                  isSelected
                    ? { backgroundColor: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.6)" }
                    : { backgroundColor: "rgba(0,0,0,0.25)", borderColor: "rgba(255,255,255,0.15)" },
                ]}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.langName, { color: isSelected ? "#ffffff" : "rgba(255,255,255,0.75)" }]}>
                    {lang.name}
                  </Text>
                  {isDetected && (
                    <View style={styles.detectedBadge}>
                      <Feather name="smartphone" size={10} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.detectedText}>{t("welcome.detectedFromDevice")}</Text>
                    </View>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={14} color="#ffffff" />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        <Pressable onPress={handleContinue} style={styles.btn}>
          <Text style={styles.btnText}>{t("welcome.continueWith")}</Text>
          <Feather name="arrow-right" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    gap: 24,
  },
  logo: { width: 52, height: 52, borderRadius: 12, alignSelf: "flex-start" },
  titleBlock: { gap: 6 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 20 },
  list: { flex: 1, gap: 10, justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  flag: { fontSize: 26 },
  rowInfo: { flex: 1, gap: 3 },
  langName: { fontSize: 15, fontWeight: "600" },
  detectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detectedText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
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
