import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { useSettings } from "@/hooks/useSettings"
import { isAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, AppState, AppStateStatus, Modal, StyleSheet, Text, View } from "react-native"

export default function AppLockScreen() {
  const { user, loginWithBiometric, login, biometricCapabilities, checkBiometricCapabilities, appLocked } = useAuthStore()
  const { settings } = useSettings()
  const [showLock, setShowLock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appState, setAppState] = useState(AppState.currentState)
  const { colors } = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    const checkLockStatus = async () => {
      if (!user || settings?.require_auth === false) {
        setShowLock(false)
        return
      }
      const locked = await isAppLocked()
      if (locked && appState === "active") {
        setShowLock(true)
        await checkBiometricCapabilities()
      } else {
        setShowLock(false)
      }
    }
    checkLockStatus()
  }, [user, appState, settings?.require_auth])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState)
      if (nextAppState.match(/inactive|background/)) {
        setShowLock(false)
      }
    }
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [])

  const handlePinComplete = async (pin: string) => {
    if (!user) return
    setLoading(true)
    try {
      const identifier = user.email || user.phone_number
      const success = await login({ identifier, pin })
      if (success) setShowLock(false)
    } catch (error) {
      console.error("Pin verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometric = async () => {
    setLoading(true)
    try {
      const success = await loginWithBiometric()
      if (success) setShowLock(false)
    } catch (error) {
      console.error("Biometric verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!showLock || !user || appState !== "active") return null

  const initials = user.full_name
    ?.split(" ")
    .map((n: string) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") ?? "?"

  return (
    <Modal visible={showLock} animationType="fade" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>

        <View style={styles.topSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary.default }]}>
            <Text style={[styles.avatarText, { color: colors.primary.foreground }]}>{initials}</Text>
          </View>
          <Text style={[styles.welcome, { color: colors.foreground.primary }]}>
            {t("auth.login.welcomeBack")}
          </Text>
          <Text style={[styles.name, { color: colors.muted.foreground }]}>
            {user.full_name}
          </Text>
        </View>

        <PinInput
          title={t("auth.login.verifyIdentity")}
          subtitle={t("auth.login.biometricSubtitle")}
          onComplete={handlePinComplete}
          onBiometric={handleBiometric}
          biometricAvailable={biometricCapabilities?.isAvailable && user.biometric_enabled}
          showBiometric={user.biometric_enabled}
        />

        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <ActivityIndicator color={colors.primary.default} size="large" />
              <Text style={[styles.loadingText, { color: colors.foreground.primary }]}>
                {t("modals.changePin.verifying")}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    fontSize: 15,
    marginTop: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },
})
