import { getDb } from "@/db/db"
import { DEFAULT_SETTINGS } from "@/constants/DefaultSettings"
import { Settings } from "@/types/settings"

export const getSettings = async (user_id: string): Promise<Settings | null> => {
  try {
    const db = getDb()
    const settings = await db.getFirstAsync<Settings>(`SELECT * FROM settings WHERE user_id = ?`, [user_id])
    return settings || null
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export const createDefaultSettings = async (user_id: string): Promise<Settings> => {
  const now = new Date().toISOString()

  try {
    const db = getDb()

    await db.runAsync(
      `INSERT INTO settings (
        user_id, notification_enabled, days_before_reminder,
        inactivity_timeout, language, remember_session, session_duration,
        theme, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        DEFAULT_SETTINGS.notification_enabled ? 1 : 0,
        DEFAULT_SETTINGS.days_before_reminder,
        DEFAULT_SETTINGS.inactivity_timeout,
        DEFAULT_SETTINGS.language,
        DEFAULT_SETTINGS.remember_session ? 1 : 0,
        DEFAULT_SETTINGS.session_duration,
        DEFAULT_SETTINGS.theme,
        now,
        now,
      ],
    )

    const newSettings = await getSettings(user_id)
    return newSettings || { ...DEFAULT_SETTINGS, user_id, created_at: now, updated_at: now }
  } catch (error) {
    console.error("Error creating default settings:", error)
    throw error
  }
}

export const ensureUserSettings = async (user_id: string): Promise<Settings> => {
  try {
    const db = getDb()
    const existingSettings = await db.getFirstAsync<Settings>(`SELECT * FROM settings WHERE user_id = ?`, [user_id])

    if (existingSettings) {
      return existingSettings
    }

    // Créer des paramètres par défaut avec les nouvelles colonnes
    const now = new Date().toISOString()
    await db.runAsync(
      `INSERT INTO settings 
      (user_id, notification_enabled, days_before_reminder, language, 
        inactivity_timeout, remember_session, session_duration, theme, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        DEFAULT_SETTINGS.notification_enabled ? 1 : 0,
        DEFAULT_SETTINGS.days_before_reminder,
        DEFAULT_SETTINGS.language,
        DEFAULT_SETTINGS.inactivity_timeout,
        DEFAULT_SETTINGS.remember_session ? 1 : 0,
        DEFAULT_SETTINGS.session_duration,
        DEFAULT_SETTINGS.theme,
        now,
        now,
      ],
    )

    return {
      user_id,
      notification_enabled: DEFAULT_SETTINGS.notification_enabled,
      days_before_reminder: DEFAULT_SETTINGS.days_before_reminder,
      language: DEFAULT_SETTINGS.language,
      inactivity_timeout: DEFAULT_SETTINGS.inactivity_timeout,
      remember_session: DEFAULT_SETTINGS.remember_session,
      session_duration: DEFAULT_SETTINGS.session_duration,
      theme: DEFAULT_SETTINGS.theme,
      created_at: now,
      updated_at: now,
    }
  } catch (error) {
    console.error("Error ensuring user settings:", error)
    throw error
  }
}

export const updateSettings = async (user_id: string, updates: Partial<Settings>): Promise<boolean> => {
  try {
    const db = getDb()
    const now = new Date().toISOString()

    const fields = []
    const values = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "user_id" && key !== "created_at" && key !== "updated_at") {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    fields.push("updated_at = ?")
    values.push(now)
    values.push(user_id)

    await db.runAsync(`UPDATE settings SET ${fields.join(", ")} WHERE user_id = ?`, values)

    return true
  } catch (error) {
    console.error("Error updating settings:", error)
    return false
  }
}

export const deleteSettings = async (user_id: string): Promise<void> => {
  try {
    const db = getDb()
    await db.runAsync(`DELETE FROM settings WHERE user_id = ?`, [user_id])
  } catch (error) {
    console.error("Error deleting settings:", error)
    throw error
  }
}