import { useState, useEffect } from "react"
import { getSettings, updateSettings } from "@/services/settingsService"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuthStore } from "@/stores/authStore"
import { User } from "@/types/user"

export const useSettings = () => {
  const { user, setUser } = useAuthStore()
  const [settings, setSettings] = useState({
    notification_enabled: true,
    days_before_reminder: 3,
    currency: "USD",
    inactivity_timeout: 30,
  })
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    if (!user?.user_id) return

    try {
      setLoading(true)
      const savedSettings = await getSettings(user.user_id)
      if (savedSettings) {
        const newSettings = {
          notification_enabled: typeof savedSettings.notification_enabled === "boolean" ? savedSettings.notification_enabled : savedSettings.notification_enabled === 1,
          days_before_reminder: savedSettings.days_before_reminder,
          currency: savedSettings.currency,
          inactivity_timeout: savedSettings.inactivity_timeout,
        }
        setSettings(newSettings)
        console.log("Settings loaded:", newSettings)

        // Mettre à jour les settings dans useAuth
        if (setUser && user) {
          setUser((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              settings: newSettings,
            }
          })
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      Alert.error("Failed to load settings", "Error")
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (field: string, value: any) => {
    if (!user?.user_id) return

    // Mise à jour optimiste de l'UI
    const previousSettings = { ...settings }
    const newSettings = { ...settings, [field]: value }
    setSettings(newSettings)

    try {
      await updateSettings(user.user_id, { [field]: value })

      if (field === "inactivity_timeout") {
        await AsyncStorage.setItem("inactivityTimeout", value.toString())
      }

      // Mettre à jour les settings dans useAuth après la mise à jour réussie
      if (setUser && user) {
        setUser((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            settings: newSettings,
          }
        })
      }
      Alert.success("Setting updated successfully", "Success")
    } catch (error) {
      console.error("Failed to update setting:", error)
      // Annuler la mise à jour optimiste en cas d'erreur
      setSettings(previousSettings)
      Alert.error("Failed to update setting", "Error")
    }
  }

  useEffect(() => {
    loadSettings()
  }, [user?.user_id])

  return {
    settings,
    loading,
    updateSetting,
    reloadSettings: loadSettings,
  }
}
