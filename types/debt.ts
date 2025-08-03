export type DebtStatus = "PENDING" | "PAID" | "OVERDUE"
export type DebtType = "OWING" | "OWED"

export interface Debt {
  debt_id: string
  user_id: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  description?: string
  due_date: string
  status: DebtStatus
  debt_type: DebtType
  created_at: string
  updated_at: string
}

export interface DebtInput {
  user_id: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  description?: string
  due_date: string
  status?: DebtStatus
  debt_type: DebtType
}
