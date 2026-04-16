export const DEFAULT_SETTINGS = {
  notification_enabled: false,
  days_before_reminder: 3,
  language: 'en',
  require_auth: true,
  inactivity_timeout: 30,
  background_lock_delay: 5, // Délai en secondes avant verrouillage en arrière-plan
  remember_session: true,
  session_duration: 86400, // 2 months en minutes (60 jours × 24h × 60min)
  system_notifications: false,
  email_notifications: false,
  sms_notifications: false,
  notification_times: ["09:00"], // Array of notification times
  notification_time: "09:00", // Backward compatibility
  summary_notifications: false,
  summary_notification_time: "20:00", // 8 PM for daily summaries
  summary_frequency: 'daily' as 'daily' | 'weekly' | 'none',
  summary_day_of_week: 1, // Sunday
}