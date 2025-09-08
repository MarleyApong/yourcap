import { getDb } from "@/db/db"
import { v4 as uuidv4 } from "uuid"
import { Debt, DebtInput, DebtStatus, DebtType } from "@/types/debt"

export const createDebt = async (debt: DebtInput): Promise<Debt> => {
  const debt_id = uuidv4()
  const now = new Date().toISOString()

  try {
    const db = getDb()

    await db.runAsync(
      `INSERT INTO debts 
      (debt_id, user_id, contact_name, contact_phone, contact_email, 
       amount, description, loan_date, due_date, status, debt_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        debt_id,
        debt.user_id,
        debt.contact_name,
        debt.contact_phone,
        debt.contact_email || null,
        debt.amount,
        debt.description || null,
        debt.loan_date,
        debt.due_date,
        debt.status || "PENDING",
        debt.debt_type,
        now,
        now,
      ],
    )

    const newDebt = await getDebtById(debt_id)
    if (!newDebt) throw new Error("Failed to retrieve created debt")
    Alert.success("Debt created successfully!", "Success")
    return newDebt
  } catch (error) {
    console.error("Create debt error:", error)
    Alert.error("Failed to create debt. Please try again.", "Error")
    throw error
  }
}

export const updateDebt = async (debt_id: string, updates: Partial<DebtInput>): Promise<Debt> => {
  const now = new Date().toISOString()

  try {
    const db = getDb()

    // Exclure les clés qui n'ont pas de valeur ou qui ne doivent pas être mises à jour
    const validUpdates = Object.entries(updates).filter(([_, value]) => value !== undefined && value !== null)

    if (validUpdates.length === 0) {
      throw new Error("No valid updates provided")
    }

    const setClause = validUpdates.map(([key]) => `${key} = ?`).join(", ")
    const values = validUpdates.map(([_, value]) => value)

    const allValues = [...values, now, debt_id]

    await db.runAsync(`UPDATE debts SET ${setClause}, updated_at = ? WHERE debt_id = ?`, allValues)

    const updatedDebt = await getDebtById(debt_id)

    if (!updatedDebt) {
      throw new Error("Failed to retrieve updated debt")
    }
    Alert.success("Debt updated successfully!", "Success")
    return updatedDebt
  } catch (error) {
    console.error("Update debt error:", error)
    Alert.error("Failed to update debt. Please try again.", "Error")
    throw error
  }
}

export const deleteDebt = async (debt_id: string): Promise<void> => {
  try {
    const db = getDb()
    await db.runAsync(`DELETE FROM debts WHERE debt_id = ?`, [debt_id])
    Alert.success("Debt deleted successfully!", "Success")
  } catch (error) {
    Alert.error("Failed to delete debt. Please try again.", "Error")
    throw error
  }
}

export const getDebtById = async (debt_id: string): Promise<Debt | null> => {
  try {
    const db = getDb()
    const debt = await db.getFirstAsync<Debt>(
      `SELECT 
        debt_id, user_id, contact_name, contact_phone, contact_email,
        amount, description, loan_date, due_date, status, debt_type,
        created_at, updated_at
       FROM debts 
       WHERE debt_id = ?`,
      [debt_id],
    )
    return debt || null
  } catch (error) {
    console.error(`Error fetching debt ${debt_id}:`, error)
    return null
  }
}

export const getUserDebts = async (user_id: string): Promise<Debt[]> => {
  try {
    const db = getDb()
    const debts = await db.getAllAsync<Debt>(
      `SELECT 
        debt_id, user_id, contact_name, contact_phone, contact_email,
        amount, description, loan_date, due_date, status, debt_type,
        created_at, updated_at
       FROM debts 
       WHERE user_id = ? 
       ORDER BY 
         CASE WHEN status = 'PENDING' THEN 1 ELSE 2 END,
         due_date ASC`,
      [user_id],
    )
    return debts || []
  } catch (error) {
    console.error(`Error fetching debts for user ${user_id}:`, error)
    return []
  }
}

export const getDebtsSummary = async (user_id: string) => {
  try {
    const db = getDb()
    const result = await db.getFirstAsync<{
      owing: number
      owed: number
    }>(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN debt_type = 'OWING' AND status = 'PENDING' THEN amount ELSE 0 END), 0) as owing,
        COALESCE(SUM(CASE WHEN debt_type = 'OWED' AND status = 'PENDING' THEN amount ELSE 0 END), 0) as owed
      FROM debts
      WHERE user_id = ?
    `,
      [user_id],
    )

    return {
      owing: result?.owing || 0,
      owed: result?.owed || 0,
      balance: (result?.owing || 0) - (result?.owed || 0),
    }
  } catch (error) {
    console.error(`Error fetching summary for user ${user_id}:`, error)
    return { owing: 0, owed: 0, balance: 0 }
  }
}
