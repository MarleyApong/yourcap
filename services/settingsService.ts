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
        user_id, notification_enabled, 
        days_before_reminder, inactivity_timeout, language, currency,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, DEFAULT_SETTINGS.notification_enabled ? 1 : 0, DEFAULT_SETTINGS.days_before_reminder, DEFAULT_SETTINGS.inactivity_timeout, DEFAULT_SETTINGS.language, now, now],
    )

    const newSettings = await getSettings(user_id)
    return newSettings || { ...DEFAULT_SETTINGS, user_id }
  } catch (error) {
    console.error("Error creating default settings:", error)
    throw error
  }
}

export const updateSettings = async (user_id: string, updates: Partial<Settings>): Promise<Settings> => {
  try {
    const db = getDb()
    const existingSettings = await getSettings(user_id)
    const now = new Date().toISOString()

    if (existingSettings) {
      // Mise à jour des paramètres existants
      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ")

      const values = Object.values(updates).map((value) => {
        // Convertir les booléens en entiers pour SQLite
        if (typeof value === "boolean") {
          return value ? 1 : 0
        }
        return value
      })

      await db.runAsync(`UPDATE settings SET ${setClause}, updated_at = ? WHERE user_id = ?`, [...values, now, user_id])
    } else {
      // Créer de nouveaux paramètres si ils n'existent pas
      const allSettings = { ...DEFAULT_SETTINGS, ...updates }
      await db.runAsync(
        `INSERT INTO settings (
          user_id, notification_enabled, 
          days_before_reminder, inactivity_timeout, language, currency,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, allSettings.notification_enabled ? 1 : 0, allSettings.days_before_reminder, allSettings.inactivity_timeout, allSettings.language, now, now],
      )
    }

    // Récupérer les paramètres mis à jour
    const updatedSettings = await getSettings(user_id)
    if (!updatedSettings) {
      throw new Error("Failed to retrieve updated settings")
    }

    return updatedSettings
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
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

// Fonction utilitaire pour s'assurer que l'utilisateur a des paramètres
export const ensureUserSettings = async (user_id: string): Promise<Settings> => {
  try {
    let settings = await getSettings(user_id)

    if (!settings) {
      settings = await createDefaultSettings(user_id)
    }

    return settings
  } catch (error) {
    console.error("Error ensuring user settings:", error)
    // Retourner les paramètres par défaut en cas d'erreur
    return { ...DEFAULT_SETTINGS, user_id }
  }
}
