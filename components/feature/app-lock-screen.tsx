import PinInput from "@/components/ui/pin-input"
import { isAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import React, { useEffect, useState } from "react"
import { AppState, AppStateStatus, Modal, Text, View } from "react-native"

export default function AppLockScreen() {
  const { user, loginWithBiometric, login, biometricCapabilities, checkBiometricCapabilities, appLocked } = useAuthStore()
  const [showLock, setShowLock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const checkLockStatus = async () => {
      if (!user) {
        setShowLock(false)
        return
      }

      const locked = await isAppLocked()
      console.log("AppLockScreen - User:", !!user, "Locked:", locked, "AppState:", appState)

      // Afficher le verrouillage seulement si l'app est active ET verrouillée
      if (locked && appState === "active") {
        setShowLock(true)
        await checkBiometricCapabilities()
      } else {
        setShowLock(false)
      }
    }

    checkLockStatus()
  }, [user, appState])

  // Écouter les changements d'état de l'application
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("AppLockScreen - App state:", nextAppState)
      setAppState(nextAppState)

      // Cacher le verrouillage quand l'app va en arrière-plan
      if (nextAppState.match(/inactive|background/)) {
        setShowLock(false)
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [])

  const handlePinComplete = async (pin: string) => {
    if (!user) return

    setLoading(true)
    try {
      const identifier = user.email || user.phone_number
      const success = await login({ identifier, pin })

      if (success) {
        setShowLock(false)
      } else {
        console.error("Pin verification failed")
        // Le PinInput gère déjà l'erreur, pas besoin de Toast ici
      }
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
      if (success) {
        setShowLock(false)
      } else {
        console.error("Biometric verification failed")
      }
    } catch (error) {
      console.error("Biometric verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Ne pas afficher si pas d'utilisateur ou si l'app n'est pas active
  if (!showLock || !user || appState !== "active") {
    return null
  }

  return (
    <Modal visible={showLock} animationType="slide" presentationStyle="formSheet" statusBarTranslucent>
      <View className="flex-1 justify-center">
        <View className="px-8 mb-1 mt-24">
          <Text className="text-2xl font-bold text-center text-primary">Welcome back</Text>
          <Text className="text-lg text-center text-gray-600 mt-2">{user.full_name}</Text>
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
          <View className="absolute inset-0 bg-black/30 flex-1 justify-center items-center">
            <View className="bg-primary rounded-xl p-6 items-center">
              <Text className="text-white">Verifying...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}
