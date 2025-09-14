export interface Settings {
  user_id: string
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  inactivity_timeout: number
  remember_session: boolean 
  session_duration: number // (en minutes)
  created_at: string
  updated_at: string
}

export interface DefaultSettings {
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  inactivity_timeout: number
  remember_session: boolean 
  session_duration: number // (en minutes)
}