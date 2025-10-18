import { getDb } from "@/db/db"
import { CreateUserInput, User } from "@/types/user"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export const getUserByIdentifier = async (identifier: string): Promise<User | null> => {
  try {
    const db = getDb()
    const user = await db.getFirstAsync<User>(
      `SELECT user_id, full_name, email, phone_number, biometric_enabled, status, created_at, updated_at 
       FROM users WHERE (email = ? OR phone_number = ?) AND status = 'ACTIVE'`,
      [identifier, identifier],
    )
    return user || null
  } catch (error) {
    console.error(`Error fetching user by identifier ${identifier}:`, error)
    return null
  }
}

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
  console.log("🔧 createUser called with:", { full_name, email, phone_number, pin: pin ? "***" : "empty" })

  // Validation des données
  if (!full_name?.trim()) {
    throw new Error("Full name is required")
  }
  if (!phone_number?.trim()) {
    throw new Error("Phone number is required")
  }
  if (!pin || pin.length !== 6) {
    throw new Error("PIN must be 6 digits")
  }

  const user_id = uuidv4()
  const now = new Date().toISOString()
  const hashedPin = await bcrypt.hash(pin, 10)

  try {
    const db = getDb()

    // Vérification si l'utilisateur existe déjà
    const existing = await db.getFirstAsync(`SELECT * FROM users WHERE email = ? OR phone_number = ?`, [email?.trim() || "", phone_number.trim()])

    if (existing) {
      throw new Error("User with this email or phone already exists")
    }

    // Insertion avec gestion des valeurs NULL
    await db.runAsync(
      `INSERT INTO users 
      (user_id, full_name, email, phone_number, pin, biometric_enabled, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name.trim(), email?.trim() || null, phone_number.trim(), hashedPin, 0, "ACTIVE", now, now],
    )

    return user_id
  } catch (error) {
    console.error("❌ Create user error:", error)
    throw error
  }
}

export const loginUser = async (
  identifier: string,
  pin: string,
  isBiometric: boolean = false,
): Promise<{ user_id: string; full_name: string; email: string; phone_number: string; biometric_enabled: boolean } | null> => {
  try {
    console.log("🔐 loginUser called:", { identifier, isBiometric })

    const db = getDb()
    const result = await db.getFirstAsync<User & { pin: string }>(
      `SELECT user_id, full_name, email, phone_number, pin, biometric_enabled
      FROM users WHERE (email = ? OR phone_number = ?) AND status = 'ACTIVE'`,
      [identifier, identifier],
    )

    console.log("🔐 User found in DB:", !!result)

    if (!result) {
      console.log("❌ No user found with identifier:", identifier)
      return null
    }

    // Si c'est une authentification biométrique, on skip la vérification du PIN
    if (isBiometric) {
      console.log("🔐 Biometric login, skipping PIN verification")
      return {
        user_id: result.user_id,
        full_name: result.full_name,
        email: result.email,
        phone_number: result.phone_number,
        biometric_enabled: !!result.biometric_enabled,
      }
    }

    // Vérification normale du PIN
    console.log("🔐 Verifying PIN...")
    const isValid = await bcrypt.compare(pin, result.pin)
    console.log("🔐 PIN valid:", isValid)

    if (!isValid) {
      console.log("❌ Invalid PIN")
      return null
    }

    console.log("✅ Login successful")
    return {
      user_id: result.user_id,
      full_name: result.full_name,
      email: result.email,
      phone_number: result.phone_number,
      biometric_enabled: !!result.biometric_enabled,
    }
  } catch (error) {
    console.error("❌ Login error:", error)
    throw error
  }
}

export const resetPin = async ({ identifier, newPin }: { identifier: string; newPin: string }): Promise<boolean> => {
  try {
    const db = getDb()
    const user = await db.getFirstAsync(`SELECT user_id FROM users WHERE (email = ? OR phone_number = ?) AND status = 'ACTIVE'`, [identifier, identifier])

    if (!user) {
      return false
    }

    const hashedPin = await bcrypt.hash(newPin, 10)
    const now = new Date().toISOString()

    await db.runAsync(`UPDATE users SET pin = ?, updated_at = ? WHERE user_id = ?`, [hashedPin, now, (user as { user_id: string }).user_id])

    return true
  } catch (error) {
    console.error("resetPin error:", error)
    return false
  }
}

export const updateBiometricPreference = async (user_id: string, enabled: boolean): Promise<boolean> => {
  try {
    const db = getDb()
    const now = new Date().toISOString()

    console.log(`🔐 Updating biometric preference for user ${user_id}: ${enabled}`)

    await db.runAsync(`UPDATE users SET biometric_enabled = ?, updated_at = ? WHERE user_id = ?`, [enabled ? 1 : 0, now, user_id])

    console.log("✅ Biometric preference updated successfully")
    return true
  } catch (error) {
    console.error("❌ Update biometric preference error:", error)
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

export const updateUserProfile = async (
  user_id: string, 
  data: { full_name: string; email: string; phone_number: string }
): Promise<boolean> => {
  try {
    const db = getDb()
    
    // Vérifier que l'utilisateur existe
    const existingUser = await getUserById(user_id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Vérifier l'unicité de l'email s'il est fourni et différent de l'actuel
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await db.getFirstAsync(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ? AND status = 'ACTIVE'",
        [data.email, user_id]
      )
      if (emailExists) {
        throw new Error("Email already exists")
      }
    }

    // Vérifier l'unicité du numéro de téléphone s'il est différent de l'actuel
    if (data.phone_number !== existingUser.phone_number) {
      const phoneExists = await db.getFirstAsync(
        "SELECT user_id FROM users WHERE phone_number = ? AND user_id != ? AND status = 'ACTIVE'",
        [data.phone_number, user_id]
      )
      if (phoneExists) {
        throw new Error("Phone number already exists")
      }
    }

    // Mettre à jour le profil
    await db.runAsync(
      `UPDATE users SET 
        full_name = ?, 
        email = ?, 
        phone_number = ?, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ?`,
      [data.full_name.trim(), data.email.trim(), data.phone_number.trim(), user_id]
    )

    return true
  } catch (error) {
    console.error("Update user profile error:", error)
    throw error
  }
}

export const verifyUserPin = async (user_id: string, pin: string): Promise<boolean> => {
  try {
    const db = getDb()
    const result = await db.getFirstAsync<{ pin: string }>(
      "SELECT pin FROM users WHERE user_id = ? AND status = 'ACTIVE'",
      [user_id]
    )
    
    if (!result) return false
    
    return await bcrypt.compare(pin, result.pin)
  } catch (error) {
    console.error("Verify user PIN error:", error)
    return false
  }
}

export const updateUserPin = async (user_id: string, newPin: string): Promise<boolean> => {
  try {
    const db = getDb()
    
    // Vérifier que l'utilisateur existe
    const existingUser = await getUserById(user_id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Hasher le nouveau PIN
    const hashedPin = await bcrypt.hash(newPin, 10)

    // Mettre à jour le PIN
    await db.runAsync(
      "UPDATE users SET pin = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
      [hashedPin, user_id]
    )

    return true
  } catch (error) {
    console.error("Update user PIN error:", error)
    throw error
  }
}
