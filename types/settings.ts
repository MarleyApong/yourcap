export interface Settings {
  user_id: string
  currency: string
  notification_enabled: boolean
  days_before_reminder: number
  inactivity_timeout: number
  language: string
  created_at?: string
  updated_at?: string
}
