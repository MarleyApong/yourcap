import { getSettings, updateSettings } from "@/services/settingsService"
import { useAuthStore } from "@/stores/authStore"
import { DefaultSettings } from "@/types/settings"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const useSettings = () => {
  const { user, setUser } = useAuthStore()
  const [settings, setSettings] = useState<DefaultSettings>({
    notification_enabled: true,
    days_before_reminder: 3,
    inactivity_timeout: 30,
    language: "en",
    remember_session: true,
    session_duration: 30,
    theme: "system",
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
          inactivity_timeout: savedSettings.inactivity_timeout,
          language: savedSettings.language,
          remember_session: typeof savedSettings.remember_session === "boolean" ? savedSettings.remember_session : savedSettings.remember_session === 1,
          session_duration: savedSettings.session_duration,
          theme: savedSettings.theme,
          created_at: savedSettings.created_at,
          updated_at: savedSettings.updated_at,
        }
        setSettings(newSettings)

        // Mettre à jour les settings dans le store auth
        if (setUser && user) {
          setUser({
            ...user,
            settings: newSettings,
          })
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      Toast.error("Failed to load settings", "Error")
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

      // Sauvegarder le timeout d'inactivité dans AsyncStorage pour le hook
      if (field === "inactivity_timeout") {
        await AsyncStorage.setItem("inactivityTimeout", value.toString())
      }

      // Mettre à jour les settings dans le store auth
      if (setUser && user) {
        setUser({
          ...user,
          settings: newSettings,
        })
      }

      Toast.success("Setting updated successfully", "Success")
    } catch (error) {
      console.error("Failed to update setting:", error)
      // Annuler la mise à jour optimiste en cas d'erreur
      setSettings(previousSettings)
      Toast.error("Failed to update setting", "Error")
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
