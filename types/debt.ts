export type DebtStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID"
export type DebtType = "OWING" | "OWED"
export type InterestType = "none" | "flat" | "monthly"

export interface Debt {
  debt_id: string
  user_id: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  currency: string
  description?: string
  loan_date: string
  due_date: string
  repayment_date?: string
  status: DebtStatus
  debt_type: DebtType
  interest_rate: number
  interest_type: InterestType
  paid_amount: number
  created_at: string
  updated_at: string
}

export interface DebtInput {
  user_id: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  currency?: string
  description?: string
  loan_date: string
  due_date: string
  repayment_date?: string
  status?: DebtStatus
  debt_type: DebtType
  interest_rate?: number
  interest_type?: InterestType
}

export interface Payment {
  payment_id: string
  debt_id: string
  amount: number
  payment_date: string
  note?: string
  created_at: string
}

export interface PaymentInput {
  debt_id: string
  amount: number
  payment_date: string
  note?: string
}

export function calcTotalDue(amount: number, interestRate: number, interestType: InterestType, loanDate: string): number {
  if (!interestRate || interestType === "none") return amount
  if (interestType === "flat") return amount + (amount * interestRate / 100)
  // monthly: simple interest based on months elapsed since loan_date
  const months = Math.max(1, Math.ceil(
    (Date.now() - new Date(loanDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ))
  return amount + months * (amount * interestRate / 100)
}
