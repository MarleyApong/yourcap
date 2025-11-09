import { DEFAULT_SETTINGS } from "@/constants/DefaultSettings"
import { getDb } from "@/db/db"
import { Settings } from "@/types/settings"

export const getSettings = async (user_id: string): Promise<Settings | null> => {
  try {
    const db = getDb()
    const settings = await db.getFirstAsync<Settings>(`SELECT * FROM settings WHERE user_id = ?`, [user_id])

    if (settings) {
      // Parse notification_times from JSON if it exists
      let notificationTimes: string[] = []
      if (settings.notification_times) {
        try {
          notificationTimes = JSON.parse(settings.notification_times as any)
        } catch (e) {
          notificationTimes = [settings.notification_time || "09:00"]
        }
      } else {
        notificationTimes = [settings.notification_time || "09:00"]
      }

      // Convertir les valeurs numériques en booléens
      return {
        ...settings,
        notification_enabled: Boolean(settings.notification_enabled),
        remember_session: Boolean(settings.remember_session),
        system_notifications: settings.system_notifications !== undefined ? Boolean(settings.system_notifications) : true,
        email_notifications: Boolean(settings.email_notifications),
        sms_notifications: Boolean(settings.sms_notifications),
        summary_notifications: settings.summary_notifications !== undefined ? Boolean(settings.summary_notifications) : true,
        notification_times: notificationTimes,
        summary_frequency: (settings.summary_frequency as 'daily' | 'weekly' | 'none') || 'daily',
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
        notification_times, summary_notifications, summary_notification_time, summary_frequency,
        background_lock_delay, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        JSON.stringify(DEFAULT_SETTINGS.notification_times),
        DEFAULT_SETTINGS.summary_notifications ? 1 : 0,
        DEFAULT_SETTINGS.summary_notification_time,
        DEFAULT_SETTINGS.summary_frequency,
        DEFAULT_SETTINGS.background_lock_delay,
        now,
        now,
      ],
    )

    const newSettings = await getSettings(user_id)
    return newSettings || { 
      ...DEFAULT_SETTINGS, 
      user_id, 
      created_at: now, 
      updated_at: now,
      notification_times: [...DEFAULT_SETTINGS.notification_times]
    }
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
      // Make sure we have the new fields, update if missing
      const needsUpdate = !existingSettings.notification_times || 
                         existingSettings.summary_notifications === undefined ||
                         !existingSettings.summary_notification_time ||
                         !existingSettings.summary_frequency

      if (needsUpdate) {
        await db.runAsync(
          `UPDATE settings SET 
           notification_times = ?, 
           summary_notifications = ?, 
           summary_notification_time = ?, 
           summary_frequency = ?,
           updated_at = ?
           WHERE user_id = ?`,
          [
            JSON.stringify([existingSettings.notification_time || "09:00"]),
            DEFAULT_SETTINGS.summary_notifications ? 1 : 0,
            DEFAULT_SETTINGS.summary_notification_time,
            DEFAULT_SETTINGS.summary_frequency,
            new Date().toISOString(),
            user_id
          ]
        )
        
        return await getSettings(user_id) || existingSettings
      }
      
      return existingSettings
    }

    // Créer des paramètres par défaut avec les nouvelles colonnes
    const now = new Date().toISOString()
    await db.runAsync(
      `INSERT INTO settings 
      (user_id, notification_enabled, days_before_reminder, language, 
        inactivity_timeout, remember_session, session_duration, 
        system_notifications, email_notifications, sms_notifications, notification_time,
        notification_times, summary_notifications, summary_notification_time, summary_frequency,
        created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        JSON.stringify(DEFAULT_SETTINGS.notification_times),
        DEFAULT_SETTINGS.summary_notifications ? 1 : 0,
        DEFAULT_SETTINGS.summary_notification_time,
        DEFAULT_SETTINGS.summary_frequency,
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
      notification_times: [...DEFAULT_SETTINGS.notification_times],
      summary_notifications: DEFAULT_SETTINGS.summary_notifications,
      summary_notification_time: DEFAULT_SETTINGS.summary_notification_time,
      summary_frequency: DEFAULT_SETTINGS.summary_frequency,
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
        } else if (key === "notification_times" && Array.isArray(value)) {
          // Convert array to JSON string for storage
          values.push(JSON.stringify(value))
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
