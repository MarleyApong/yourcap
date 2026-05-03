import { getDb } from "@/db/db"
import { calcTotalDue, calcLateInterestAmount, Payment, PaymentInput } from "@/types/debt"
import { v4 as uuidv4 } from "uuid"
import { getDebtById, updateDebt } from "./debtServices"

export const addPayment = async (input: PaymentInput): Promise<Payment> => {
  const db = getDb()
  const payment_id = uuidv4()
  const now = new Date().toISOString()

  const debt = await getDebtById(input.debt_id)
  if (!debt) throw new Error("Debt not found")

  const totalDue = calcTotalDue(debt.amount, debt.interest_rate, debt.interest_type, debt.loan_date, debt.due_date, debt.late_interest_rate, debt.late_interest_type)
  const currentPaid = debt.paid_amount ?? 0
  const newPaid = currentPaid + input.amount

  if (input.amount <= 0) throw new Error("invalid_amount")
  if (input.amount > totalDue - currentPaid) throw new Error("exceeds_remaining")

  await db.runAsync(
    `INSERT INTO payments (payment_id, debt_id, amount, payment_date, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payment_id, input.debt_id, input.amount, input.payment_date, input.note ?? null, now]
  )

  const newStatus = newPaid >= totalDue ? "PAID" : "PARTIALLY_PAID"
  await updateDebt(input.debt_id, { status: newStatus })

  return { payment_id, debt_id: input.debt_id, amount: input.amount, payment_date: input.payment_date, note: input.note, created_at: now }
}

export const getPayments = async (debt_id: string): Promise<Payment[]> => {
  const db = getDb()
  const rows = await db.getAllAsync<Payment>(
    `SELECT payment_id, debt_id, amount, payment_date, note, created_at
     FROM payments WHERE debt_id = ? ORDER BY payment_date DESC`,
    [debt_id]
  )
  return rows ?? []
}

export const deletePayment = async (payment_id: string, debt_id: string): Promise<void> => {
  const db = getDb()
  await db.runAsync(`DELETE FROM payments WHERE payment_id = ?`, [payment_id])

  const debt = await getDebtById(debt_id)
  if (!debt) return

  const totalDue = calcTotalDue(debt.amount, debt.interest_rate, debt.interest_type, debt.loan_date, debt.due_date, debt.late_interest_rate, debt.late_interest_type)
  const newPaid = debt.paid_amount ?? 0

  const newStatus = newPaid <= 0 ? (debt.status === "OVERDUE" ? "OVERDUE" : "PENDING") : newPaid >= totalDue ? "PAID" : "PARTIALLY_PAID"
  await updateDebt(debt_id, { status: newStatus })
}
