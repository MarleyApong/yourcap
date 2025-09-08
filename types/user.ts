export interface User {
  user_id: string
  full_name: string
  email: string
  phone_number: string
  biometric_enabled: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  full_name: string
  email: string
  phone_number: string
}
