import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/authStore"
import { getSettings, updateSettings } from "@/services/settingsService"

export const useSettings = () => {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userSettings = await getSettings(user.user_id)
      setSettings(userSettings)
    } catch (error) {
      console.error("Error loading settings:", error)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fonction pour forcer le refresh
  const refreshSettings = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSetting = async (key: string, value: any) => {
    if (!user || !settings) return false

    try {
      const success = await updateSettings(user.user_id, { [key]: value })
      if (success) {
        // Mettre à jour le state local immédiatement
        setSettings((prev: any) => ({ ...prev, [key]: value }))
        console.log(`✅ Setting ${key} updated to:`, value)
      }
      return success
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      return false
    }
  }

  return {
    settings: settings || {},
    loading,
    updateSetting,
    refreshSettings,
  }
}
