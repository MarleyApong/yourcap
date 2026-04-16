export interface Settings {
  user_id: string
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  require_auth?: boolean // Whether authentication is required on app open (default: true)
  inactivity_timeout: number
  background_lock_delay?: number // Délai en secondes avant verrouillage en arrière-plan
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
  summary_day_of_week?: number // 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
  created_at: string
  updated_at: string
}

export interface DefaultSettings {
  notification_enabled: boolean
  days_before_reminder: number
  language: string
  require_auth: boolean
  inactivity_timeout: number
  background_lock_delay: number // Délai en secondes avant verrouillage en arrière-plan
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
  summary_day_of_week: number
}