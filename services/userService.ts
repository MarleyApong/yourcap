import db from "@/db/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { CreateUserInput, User } from "@/types/user"
import Toast from "react-native-toast-message"

export const createUser = async ({ full_name, email, phone_number, password }: CreateUserInput): Promise<void> => {
  const user_id = uuidv4()
  const now = new Date().toISOString()
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Verify if exist already
    const existing = await db.getFirstAsync(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [email, phone_number])

    if (existing) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User already exists with this email or phone number.",
      })
      return
    }

    // Insertion
    await db.runAsync(
      `INSERT INTO users 
      (user_id, full_name, email, phone_number, password, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, email, phone_number, hashedPassword, "ACTIVE", now, now],
    )
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Registration failed. Please try again.",
    })
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
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Login failed. Please check your credentials and try again.",
    })
    throw error
  }
}
