import db from "@/db/db"
import { DEFAULT_SETTINGS } from "@/constants/DefaultSettings"
import { Settings } from "@/types/settings"
import Toast from "react-native-toast-message"

export const getSettings = async (user_id: string): Promise<Settings | null> => {
  try {
    const settings = await db.getFirstAsync<Settings>(
      `
      SELECT * FROM settings WHERE user_id = ?
    `,
      [user_id],
    )

    return settings || null
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export const updateSettings = async (user_id: string, updates: Partial<Settings>): Promise<Settings> => {
  try {
    const existingSettings = await getSettings(user_id)
    const now = new Date().toISOString()

    if (existingSettings) {
      // Mise à jour
      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ")

      const values = Object.values(updates)
      await db.runAsync(`UPDATE settings SET ${setClause}, updated_at = ? WHERE user_id = ?`, [...values, now, user_id])
    } else {
      // Insertion
      const allSettings = { ...DEFAULT_SETTINGS, ...updates }
      await db.runAsync(
        `INSERT INTO settings (
          user_id, currency, notification_enabled, 
          days_before_reminder, inactivity_timeout, language,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, allSettings.currency, allSettings.notification_enabled ? 1 : 0, allSettings.days_before_reminder, allSettings.inactivity_timeout, allSettings.language, now, now],
      )
    }

    const updatedSettings = await getSettings(user_id)
    return updatedSettings || { ...DEFAULT_SETTINGS, ...updates, user_id }
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}
