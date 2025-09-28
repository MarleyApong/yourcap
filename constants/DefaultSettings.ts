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
  notification_time: "09:00",
} as const