import { useTheme } from "@/core/theme"
import { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useTranslation } from "@/i18n"
import { Link } from "expo-router"
import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native"

const { height: screenHeight } = Dimensions.get("window")

export default function Index() {
  useAppStartup()
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <ImageBackground
      source={require("@/assets/images/bg/welcome.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

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
