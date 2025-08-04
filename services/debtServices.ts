import db from "@/db/db"
import { v4 as uuidv4 } from "uuid"
import Toast from "react-native-toast-message"
import { Debt, DebtInput, DebtStatus, DebtType } from "@/types/debt"

export const createDebt = async (debt: DebtInput): Promise<Debt> => {
  const debt_id = uuidv4()
  const now = new Date().toISOString()

  try {
    await db.runAsync(
      `INSERT INTO debts 
      (debt_id, user_id, contact_name, contact_phone, contact_email, amount, description, due_date, status, debt_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        debt_id,
        debt.user_id ?? null,
        debt.contact_name ?? null,
        debt.contact_phone ?? null,
        debt.contact_email ?? null,
        debt.amount ?? null,
        debt.description ?? null,
        debt.due_date ?? null,
        debt.status ?? "PENDING",
        debt.debt_type ?? null,
        now,
        now,
      ],
    )

    const newDebt = await db.getFirstAsync<Debt>(`SELECT * FROM debts WHERE debt_id = ?`, [debt_id])

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Debt created successfully!",
    })

    return newDebt!
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to create debt. Please try again.",
    })
    throw error
  }
}

export const updateDebt = async (debt_id: string, updates: Partial<DebtInput>): Promise<Debt> => {
  const now = new Date().toISOString()

  try {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")

    const values = Object.values(updates)
    values.push(debt_id)

    await db.runAsync(`UPDATE debts SET ${setClause}, updated_at = ? WHERE debt_id = ?`, [...values, now, debt_id])

    const updatedDebt = await db.getFirstAsync<Debt>(`SELECT * FROM debts WHERE debt_id = ?`, [debt_id])

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Debt updated successfully!",
    })

    return updatedDebt!
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to update debt. Please try again.",
    })
    throw error
  }
}

export const deleteDebt = async (debt_id: string): Promise<void> => {
  try {
    await db.runAsync(`DELETE FROM debts WHERE debt_id = ?`, [debt_id])

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Debt deleted successfully!",
    })
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to delete debt. Please try again.",
    })
    throw error
  }
}

export const getDebtById = async (debt_id: string): Promise<Debt | null> => {
  try {
    return await db.getFirstAsync<Debt>(`SELECT * FROM debts WHERE debt_id = ?`, [debt_id])
  } catch (error) {
    console.error("Error fetching debt:", error)
    return null
  }
}

export const getUserDebts = async (user_id: string): Promise<Debt[]> => {
  try {
    return await db.getAllAsync<Debt>(`SELECT * FROM debts WHERE user_id = ? ORDER BY due_date ASC`, [user_id])
  } catch (error) {
    console.error("Error fetching debts:", error)
    return []
  }
}

export const getDebtsSummary = async (user_id: string) => {
  try {
    const owing = await db.getFirstAsync<{ total: number }>(`SELECT SUM(amount) as total FROM debts WHERE user_id = ? AND debt_type = 'OWING' AND status = 'PENDING'`, [user_id])

    const owed = await db.getFirstAsync<{ total: number }>(`SELECT SUM(amount) as total FROM debts WHERE user_id = ? AND debt_type = 'OWED' AND status = 'PENDING'`, [user_id])

    return {
      owing: owing?.total || 0,
      owed: owed?.total || 0,
      balance: (owing?.total || 0) - (owed?.total || 0),
    }
  } catch (error) {
    console.error("Error fetching debts summary:", error)
    return { owing: 0, owed: 0, balance: 0 }
  }
}
