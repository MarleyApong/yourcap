export interface User {
  user_id: string
  firstname: string
  lastname: string
  email: string
  phone_number: string
  password: string
  status: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateUserInput {
  firstname: string
  lastname: string
  email: string
  phone_number: string
  password: string
}
