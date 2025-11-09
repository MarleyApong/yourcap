import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { getTranslationFunction } from "../i18n"
import { generateLocalizedSummaryContent } from "../lib/notification-utils"
import { getUserDebts } from "./debtServices"
import { getSettings } from "./settingsService"

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      console.log("Notifications only work on physical devices")
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions denied")
      return false
    }

    // Configure Android channels
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("debt-reminders", {
        name: "Debt Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#562d8f",
        sound: "default",
        showBadge: true,
        enableLights: true,
        enableVibrate: true,
      })

      await Notifications.setNotificationChannelAsync("summary-notifications", {
        name: "Summary Notifications",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#562d8f",
        sound: "default",
        showBadge: true,
        enableLights: true,
        enableVibrate: true,
      })
    }

    return true
  } catch (error) {
    console.error("Error requesting notification permissions:", error)
    return false
  }
}

export const scheduleDebtReminder = async (
  debtId: string,
  contactName: string,
  amount: number,
  currency: string,
  dueDate: string,
  debtType: "OWING" | "OWED",
  reminderDays: number,
  notificationTimes: string[] = ["09:00"],
): Promise<string[]> => {
  try {
    const dueDateObj = new Date(dueDate)
    const reminderDate = new Date(dueDateObj)
    reminderDate.setDate(reminderDate.getDate() - reminderDays)

    // Don't schedule if reminder date is in the past
    if (reminderDate <= new Date()) {
      console.log("Reminder date is in the past, skipping")
      return []
    }

    const isOwing = debtType === "OWING"
    const title = isOwing ? `💰 Debt Reminder` : `⚠️ Payment Reminder`

    const body = isOwing
      ? `${contactName} owes you ${amount} ${currency}. Due in ${reminderDays} day${reminderDays > 1 ? "s" : ""}.`
      : `Don't forget: You owe ${contactName} ${amount} ${currency}. Due in ${reminderDays} day${reminderDays > 1 ? "s" : ""}.`

    const scheduledIds: string[] = []

    // Schedule notification for each selected time
    for (const time of notificationTimes) {
      const [hours, minutes] = time.split(':').map(Number)
      const notificationDate = new Date(reminderDate)
      notificationDate.setHours(hours, minutes, 0, 0)

      // Skip if this specific time is in the past
      if (notificationDate <= new Date()) {
        continue
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            debtId,
            type: "debt_reminder",
            debtType,
            contactName,
            amount,
            currency,
            scheduledTime: time,
          },
          sound: "default",
          color: "#562d8f",
          ...(Platform.OS === "android" && {
            channelId: "debt-reminders",
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
      })

      console.log(`Notification scheduled: ${identifier} for ${notificationDate} at ${time}`)
      scheduledIds.push(identifier)
    }

    return scheduledIds
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return []
  }
}

export const cancelDebtReminder = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
    console.log("Notification cancelled:", notificationId)
  } catch (error) {
    console.error("Error cancelling notification:", error)
  }
}

// New function for summary notifications with localization
export const scheduleSummaryNotification = async (
  userId: string,
  summaryTime: string,
  frequency: 'daily' | 'weekly'
): Promise<string | null> => {
  try {
    const [hours, minutes] = summaryTime.split(':').map(Number)
    
    let trigger: any
    let notificationId: string

    if (frequency === 'daily') {
      // Schedule daily at the specified time
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      }
      notificationId = `summary_daily_${userId}`
    } else {
      // Schedule weekly (every Sunday at the specified time)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday
        hour: hours,
        minute: minutes,
      }
      notificationId = `summary_weekly_${userId}`
    }

    // Get user language for localized notifications
    const settings = await getSettings(userId)
    const language = settings?.language || 'en'
    const t = getTranslationFunction(language as any)

    // Cancel existing summary notification
    await Notifications.cancelScheduledNotificationAsync(notificationId)

    // Generate fresh localized content at the time of scheduling
    const { title, body } = await generateLocalizedSummaryContent(userId, t, frequency)

    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title,
        body,
        data: {
          type: "summary_notification",
          frequency,
          userId,
        },
        sound: "default",
        color: "#562d8f",
        ...(Platform.OS === "android" && {
          channelId: "summary-notifications",
        }),
      },
      trigger,
    })

    console.log(`${frequency} summary notification scheduled:`, identifier)
    return identifier
  } catch (error) {
    console.error("Error scheduling summary notification:", error)
    return null
  }
}



export const scheduleAllDebtReminders = async (userId: string): Promise<void> => {
  try {
    // Get user settings
    const settings = await getSettings(userId)
    if (!settings?.notification_enabled) {
      console.log("Notifications disabled for user")
      return
    }

    // Get all pending debts
    const debts = await getUserDebts(userId)
    const pendingDebts = debts.filter((debt) => debt.status === "PENDING")

    console.log(`Scheduling reminders for ${pendingDebts.length} pending debts`)

    // Cancel all existing debt reminder notifications first
    await Notifications.cancelAllScheduledNotificationsAsync()

    // Get notification times (use backward compatibility)
    const notificationTimes = settings.notification_times && settings.notification_times.length > 0 
      ? settings.notification_times 
      : [settings.notification_time || "09:00"]

    // Schedule new debt reminder notifications
    for (const debt of pendingDebts) {
      await scheduleDebtReminder(
        debt.debt_id, 
        debt.contact_name, 
        debt.amount, 
        debt.currency || "XAF", 
        debt.due_date, 
        debt.debt_type, 
        settings.days_before_reminder,
        notificationTimes
      )
    }

    // Schedule summary notifications if enabled
    if (settings.summary_notifications && settings.summary_frequency !== 'none') {
      const summaryTime = settings.summary_notification_time || "20:00"
      await scheduleSummaryNotification(userId, summaryTime, settings.summary_frequency || 'daily')
    }
  } catch (error) {
    console.error("Error scheduling all debt reminders:", error)
  }
}

export const updateNotificationSettings = async (userId: string): Promise<void> => {
  try {
    const settings = await getSettings(userId)

    if (settings?.notification_enabled) {
      // Request permissions and schedule notifications
      const hasPermission = await requestNotificationPermissions()
      if (hasPermission) {
        await scheduleAllDebtReminders(userId)
      }
    } else {
      // Cancel all notifications if disabled
      await Notifications.cancelAllScheduledNotificationsAsync()
      console.log("All notifications cancelled due to settings")
    }
  } catch (error) {
    console.error("Error updating notification settings:", error)
  }
}

// Fonction pour gérer les interactions avec les notifications
export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  console.log("Notification response:", response)
  const data = response.notification.request.content.data

  if (data.type === "summary_notification") {
    // Navigation vers le dashboard pour voir le résumé
    console.log("Navigate to dashboard for summary")
  } else if (data.debtId) {
    // Navigation vers le détail de la dette
    console.log("Navigate to debt:", data.debtId)
  }
}

// Function to refresh summary notifications with updated content
export const refreshSummaryNotifications = async (userId: string): Promise<void> => {
  try {
    const settings = await getSettings(userId)
    if (!settings?.summary_notifications || settings.summary_frequency === 'none') {
      return
    }

    // Reschedule summary notifications with fresh content
    const summaryTime = settings.summary_notification_time || "20:00"
    await scheduleSummaryNotification(userId, summaryTime, settings.summary_frequency || 'daily')
    
    console.log("Summary notifications refreshed with updated content")
  } catch (error) {
    console.error("Error refreshing summary notifications:", error)
  }
}

// Function to send immediate summary notification content
export const updateSummaryNotificationContent = async (userId: string): Promise<void> => {
  try {
    const settings = await getSettings(userId)
    if (!settings?.summary_notifications || settings.summary_frequency === 'none') {
      return
    }

    // Get user language for localized notifications
    const language = settings?.language || 'en'
    const t = getTranslationFunction(language as any)

    // Generate fresh localized content for immediate notification
    const { title, body } = await generateLocalizedSummaryContent(userId, t, 'daily')
    
    // Send immediate summary notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: "summary_notification",
          frequency: "immediate",
          userId,
        },
        sound: "default",
        color: "#562d8f",
        ...(Platform.OS === "android" && {
          channelId: "summary-notifications",
        }),
      },
      trigger: null, // Send immediately
    })

    console.log("Immediate summary notification sent")
  } catch (error) {
    console.error("Error sending summary notification:", error)
  }
}
