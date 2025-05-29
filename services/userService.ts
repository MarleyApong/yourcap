import db from "@/db/db"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import { CreateUserInput, User } from "@/types/user"

export const createUser = async ({ firstname, lastname, email, phone_number, password }: CreateUserInput): Promise<void> => {
  const user_id = uuidv4()
  const now = new Date().toISOString()
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await db.runAsync(
      `INSERT INTO users 
      (user_id, firstname, lastname, email, phone_number, password, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, firstname, lastname, email, phone_number, hashedPassword, "active", now, now],
    )
  } catch (error) {
    console.error("Erreur création utilisateur :", error)
    throw error
  }
}

export const loginUser = async (identifier: string, password: string): Promise<User | null> => {
  try {
    const result = await db.getFirstAsync<User>(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [identifier, identifier])

    if (!result) return null

    const isValid = await bcrypt.compare(password, result.password)
    return isValid ? result : null
  } catch (error) {
    console.error("Erreur login :", error)
    throw error
  }
}
