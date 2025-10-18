export const DEFAULT_SETTINGS = {
  notification_enabled: true,
  days_before_reminder: 3,
  language: 'en',
  inactivity_timeout: 30,
  remember_session: true,
  session_duration: 1440, // 24h en minutes
  system_notifications: true,
  email_notifications: false,
  sms_notifications: false,
  notification_times: ["09:00"], // Array of notification times
  notification_time: "09:00", // Backward compatibility
  summary_notifications: true,
  summary_notification_time: "20:00", // 8 PM for daily summaries
  summary_frequency: 'daily' as 'daily' | 'weekly' | 'none',
}