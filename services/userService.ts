import db from "@/db/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { CreateUserInput, User } from "@/types/user"

export const getUserById = async (user_id: string): Promise<User | null> => {
  try {
    const user = await db.getFirstAsync<User>(
      `SELECT user_id, full_name, email, phone_number, status, created_at, updated_at 
       FROM users WHERE user_id = ? AND status = 'ACTIVE'`,
      [user_id],
    )
    return user || null
  } catch (error) {
    console.error(`Error fetching user ${user_id}:`, error)
    return null
  }
}

export const createUser = async ({ full_name, email, phone_number, password }: CreateUserInput): Promise<string> => {
  const user_id = uuidv4()
  const now = new Date().toISOString()
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Vérification si l'utilisateur existe déjà
    const existing = await db.getFirstAsync(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [email, phone_number])

    if (existing) {
      Alert.error("Registration failed. Please try again.", "Error")
      throw new Error("User already exists")
    }

    // Insertion
    await db.runAsync(
      `INSERT INTO users 
      (user_id, full_name, email, phone_number, password, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, email, phone_number, hashedPassword, "ACTIVE", now, now],
    )

    return user_id // Retourne le user_id créé
  } catch (error) {
    Alert.error("Registration failed. Please try again.", "Error")
    throw error
  }
}

export const loginUser = async (identifier: string, password: string): Promise<{ user_id: string; full_name: string; email: string; phone_number: string } | null> => {
  try {
    const result = await db.getFirstAsync<User>(
      `SELECT user_id, full_name, email, phone_number, password 
       FROM users WHERE email = ? OR phone_number = ? AND status = 'ACTIVE'`,
      [identifier, identifier],
    )

    if (!result) return null

    const isValid = await bcrypt.compare(password, result.password)
    if (!isValid) return null

    return {
      user_id: result.user_id,
      full_name: result.full_name,
      email: result.email,
      phone_number: result.phone_number,
    }
  } catch (error) {
    Alert.error("Login failed. Please check your credentials and try again.", "Error")
    throw error
  }
}

export const resetPassword = async ({
  identifier,
  newPassword,
}: {
  identifier: string // email ou phone
  newPassword: string
}): Promise<boolean> => {
  try {
    const user = await db.getFirstAsync(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [identifier, identifier])

    if (!user) {
      Alert.error("No user found with this email or phone number.", "Error")
      return false
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const now = new Date().toISOString()

    await db.runAsync(`UPDATE users SET password = ?, updated_at = ? WHERE user_id = ?`, [hashedPassword, now, (user as { user_id: string }).user_id])

    Alert.success("Password reset successfully!", "Success")
    return true
  } catch (error) {
    console.error("resetPassword error:", error)
    Alert.error("Failed to reset password. Please try again.", "Error")
    return false
  }
}
