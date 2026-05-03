export type DebtStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIALLY_PAID"
export type DebtType = "OWING" | "OWED"
export type InterestType = "none" | "flat" | "monthly"
export type LateInterestType = "none" | "daily" | "monthly"

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
  late_interest_rate: number
  late_interest_type: LateInterestType
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
  late_interest_rate?: number
  late_interest_type?: LateInterestType
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

// Returns the base amount + regular interest, without late penalty
export function calcBaseWithInterest(amount: number, interestRate: number, interestType: InterestType, loanDate: string): number {
  if (!interestRate || interestType === "none") return amount
  if (interestType === "flat") return amount + (amount * interestRate / 100)
  const months = Math.max(1, Math.ceil(
    (Date.now() - new Date(loanDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ))
  return amount + months * (amount * interestRate / 100)
}

// Returns only the late penalty amount (0 if not overdue or no rate set)
export function calcLateInterestAmount(
  base: number,
  dueDate: string,
  lateInterestRate: number,
  lateInterestType: LateInterestType
): number {
  if (!lateInterestRate || lateInterestType === "none") return 0
  const now = Date.now()
  const due = new Date(dueDate).getTime()
  if (now <= due) return 0
  const msOverdue = now - due
  if (lateInterestType === "daily") {
    const days = Math.ceil(msOverdue / (1000 * 60 * 60 * 24))
    return base * (lateInterestRate / 100) * days
  }
  // monthly
  const months = Math.max(1, Math.ceil(msOverdue / (1000 * 60 * 60 * 24 * 30)))
  return base * (lateInterestRate / 100) * months
}

// Full total = base + regular interest + late penalty
export function calcTotalDue(
  amount: number,
  interestRate: number,
  interestType: InterestType,
  loanDate: string,
  dueDate?: string,
  lateInterestRate?: number,
  lateInterestType?: LateInterestType
): number {
  const base = calcBaseWithInterest(amount, interestRate, interestType, loanDate)
  if (!dueDate || !lateInterestRate || !lateInterestType) return base
  return base + calcLateInterestAmount(base, dueDate, lateInterestRate, lateInterestType)
}
