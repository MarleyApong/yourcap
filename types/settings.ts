export interface Settings {
  user_id: string
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  inactivity_timeout: number
  created_at?: string
  updated_at?: string
}
