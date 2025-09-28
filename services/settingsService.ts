import { getDb } from "@/db/db"
import { DEFAULT_SETTINGS } from "@/constants/DefaultSettings"
import { Settings } from "@/types/settings"

export const getSettings = async (user_id: string): Promise<Settings | null> => {
  try {
    const db = getDb()
    const settings = await db.getFirstAsync<Settings>(`SELECT * FROM settings WHERE user_id = ?`, [user_id])

    if (settings) {
      // Convertir les valeurs numériques en booléens
      return {
        ...settings,
        notification_enabled: Boolean(settings.notification_enabled),
        remember_session: Boolean(settings.remember_session),
        system_notifications: settings.system_notifications !== undefined ? Boolean(settings.system_notifications) : true,
        email_notifications: Boolean(settings.email_notifications),
        sms_notifications: Boolean(settings.sms_notifications),
      }
    }

    return null
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
        system_notifications, email_notifications, sms_notifications, notification_time,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        DEFAULT_SETTINGS.notification_enabled ? 1 : 0,
        DEFAULT_SETTINGS.days_before_reminder,
        DEFAULT_SETTINGS.inactivity_timeout,
        DEFAULT_SETTINGS.language,
        DEFAULT_SETTINGS.remember_session ? 1 : 0,
        DEFAULT_SETTINGS.session_duration,
        DEFAULT_SETTINGS.system_notifications ? 1 : 0,
        DEFAULT_SETTINGS.email_notifications ? 1 : 0,
        DEFAULT_SETTINGS.sms_notifications ? 1 : 0,
        DEFAULT_SETTINGS.notification_time,
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
        inactivity_timeout, remember_session, session_duration, 
        system_notifications, email_notifications, sms_notifications, notification_time,
        created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        DEFAULT_SETTINGS.notification_enabled ? 1 : 0,
        DEFAULT_SETTINGS.days_before_reminder,
        DEFAULT_SETTINGS.language,
        DEFAULT_SETTINGS.inactivity_timeout,
        DEFAULT_SETTINGS.remember_session ? 1 : 0,
        DEFAULT_SETTINGS.session_duration,
        DEFAULT_SETTINGS.system_notifications ? 1 : 0,
        DEFAULT_SETTINGS.email_notifications ? 1 : 0,
        DEFAULT_SETTINGS.sms_notifications ? 1 : 0,
        DEFAULT_SETTINGS.notification_time,
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
      system_notifications: DEFAULT_SETTINGS.system_notifications,
      email_notifications: DEFAULT_SETTINGS.email_notifications,
      sms_notifications: DEFAULT_SETTINGS.sms_notifications,
      notification_time: DEFAULT_SETTINGS.notification_time,
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
        // Convertir les booléens en nombres pour SQLite
        if (typeof value === "boolean") {
          values.push(value ? 1 : 0)
        } else {
          values.push(value)
        }
      }
    })

    fields.push("updated_at = ?")
    values.push(now)
    values.push(user_id)

    const query = `UPDATE settings SET ${fields.join(", ")} WHERE user_id = ?`
    console.log("🔧 Updating settings:", query, values)

    await db.runAsync(query, values)

    console.log("✅ Settings updated successfully")
    return true
  } catch (error) {
    console.error("❌ Error updating settings:", error)
    return false
  }
}
