export interface Settings {
  user_id: string
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  inactivity_timeout: number
  remember_session: boolean
  session_duration: number // (en minutes)
  system_notifications?: boolean
  email_notifications?: boolean
  sms_notifications?: boolean
  notification_times?: string[] // Array of times in HH:MM format
  notification_time?: string // Backward compatibility - Format HH:MM
  summary_notifications?: boolean // For daily/weekly summaries
  summary_notification_time?: string // When to send summary notifications
  summary_frequency?: 'daily' | 'weekly' | 'none' // How often to send summaries
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
  system_notifications: boolean
  email_notifications: boolean
  sms_notifications: boolean
  notification_times: string[] // Array of times in HH:MM format
  notification_time: string // Format HH:MM
  summary_notifications: boolean
  summary_notification_time: string
  summary_frequency: 'daily' | 'weekly' | 'none'
}