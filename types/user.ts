export interface User {
  user_id: string
  full_name: string
  email: string
  phone_number: string
  password: string
  status: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateUserInput {
  full_name: string
  email: string
  phone_number: string
  password: string
}
