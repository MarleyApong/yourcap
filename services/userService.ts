import { getDb } from "@/db/db"
import { CreateUserInput, User } from "@/types/user"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export const getUserById = async (user_id: string): Promise<User | null> => {
  try {
    const db = getDb()
    const user = await db.getFirstAsync<User>(
      `SELECT user_id, full_name, email, phone_number, biometric_enabled, status, created_at, updated_at 
       FROM users WHERE user_id = ? AND status = 'ACTIVE'`,
      [user_id],
    )
    return user || null
  } catch (error) {
    console.error(`Error fetching user ${user_id}:`, error)
    return null
  }
}

export const createUser = async ({ full_name, email, phone_number, pin }: CreateUserInput & { pin: string }): Promise<string> => {
  const user_id = uuidv4()
  const now = new Date().toISOString()
  const hashedPin = await bcrypt.hash(pin, 10)

  try {
    const db = getDb()

    // Vérification si l'utilisateur existe déjà
    const existing = await db.getFirstAsync(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [email, phone_number])

    if (existing) {
      Toast.error("User with this email or phone already exists", "Registration Error")
      throw new Error("User already exists")
    }

    // Insertion
    await db.runAsync(
      `INSERT INTO users 
      (user_id, full_name, email, phone_number, pin, biometric_enabled, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, email, phone_number, hashedPin, 0, "ACTIVE", now, now],
    )

    return user_id
  } catch (error) {
    console.error("Create user error:", error)
    Toast.error("Registration failed. Please try again.", "Error")
    throw error
  }
}

export const loginUser = async (
  identifier: string,
  pin: string,
): Promise<{ user_id: string; full_name: string; email: string; phone_number: string; biometric_enabled: boolean } | null> => {
  try {
    const db = getDb()
    const result = await db.getFirstAsync<User & { pin: string }>(
      `SELECT user_id, full_name, email, phone_number, pin, biometric_enabled
       FROM users WHERE (email = ? OR phone_number = ?) AND status = 'ACTIVE'`,
      [identifier, identifier],
    )

    if (!result) return null

    const isValid = await bcrypt.compare(pin, result.pin)
    if (!isValid) return null

    return {
      user_id: result.user_id,
      full_name: result.full_name,
      email: result.email,
      phone_number: result.phone_number,
      biometric_enabled: !!result.biometric_enabled,
    }
  } catch (error) {
    console.error("Login error:", error)
    Toast.error("Login failed. Please check your credentials and try again.", "Error")
    throw error
  }
}

export const resetPin = async ({ identifier, newPin }: { identifier: string; newPin: string }): Promise<boolean> => {
  try {
    const db = getDb()
    const user = await db.getFirstAsync(`SELECT user_id FROM users WHERE (email = ? OR phone_number = ?) AND status = 'ACTIVE'`, [identifier, identifier])

    if (!user) {
      Toast.error("No user found with this email or phone number.", "Error")
      return false
    }

    const hashedPin = await bcrypt.hash(newPin, 10)
    const now = new Date().toISOString()

    await db.runAsync(`UPDATE users SET pin = ?, updated_at = ? WHERE user_id = ?`, [hashedPin, now, (user as { user_id: string }).user_id])

    Toast.success("PIN reset successfully!", "Success")
    return true
  } catch (error) {
    console.error("resetPin error:", error)
    Toast.error("Failed to reset PIN. Please try again.", "Error")
    return false
  }
}

export const updateBiometricPreference = async (user_id: string, enabled: boolean): Promise<boolean> => {
  try {
    const db = getDb()
    const now = new Date().toISOString()

    await db.runAsync(`UPDATE users SET biometric_enabled = ?, updated_at = ? WHERE user_id = ?`, [enabled ? 1 : 0, now, user_id])

    return true
  } catch (error) {
    console.error("Update biometric preference error:", error)
    return false
  }
}

export const verifyPin = async (user_id: string, pin: string): Promise<boolean> => {
  try {
    const db = getDb()
    const result = await db.getFirstAsync<{ pin: string }>(`SELECT pin FROM users WHERE user_id = ? AND status = 'ACTIVE'`, [user_id])

    if (!result) return false

    return await bcrypt.compare(pin, result.pin)
  } catch (error) {
    console.error("Verify PIN error:", error)
    return false
  }
}
