export const DEFAULT_SETTINGS = {
  notification_enabled: true,
  days_before_reminder: 3,
  language: 'en',
  inactivity_timeout: 30,
  remember_session: true,
  session_duration: 1440, // 24h en minutes
  theme: 'system',
} as const