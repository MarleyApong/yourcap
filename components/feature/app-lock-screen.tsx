import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { isAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import React, { useEffect, useState } from "react"
import { AppState, AppStateStatus, Modal, StyleSheet, Text, View } from "react-native"

export default function AppLockScreen() {
  const { user, loginWithBiometric, login, biometricCapabilities, checkBiometricCapabilities, appLocked } = useAuthStore()
  const { settings } = useSettings()
  const [showLock, setShowLock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appState, setAppState] = useState(AppState.currentState)
  const { colors } = useTheme()

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

  return (
    <Modal visible={showLock} animationType="slide" presentationStyle="formSheet" statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={[styles.welcome, { color: colors.primary.default }]}>Welcome back</Text>
          <Text style={[styles.name, { color: colors.muted.foreground }]}>{user.full_name}</Text>
        </View>

        <PinInput
          title="Verify Identity"
          subtitle="Enter your PIN or use biometric to continue"
          onComplete={handlePinComplete}
          onBiometric={handleBiometric}
          biometricAvailable={biometricCapabilities?.isAvailable && user.biometric_enabled}
          showBiometric={user.biometric_enabled}
        />

        {loading && (
          <View style={styles.overlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
              <Text style={[styles.loadingText, { color: colors.primary.foreground }]}>Verifying...</Text>
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
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 32,
    marginBottom: 4,
    marginTop: 96,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  name: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
  },
})
