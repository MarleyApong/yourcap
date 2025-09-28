import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
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

    // Configure Android channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("debt-reminders", {
        name: "Debt Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
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
): Promise<string | null> => {
  try {
    const dueDateObj = new Date(dueDate)
    const reminderDate = new Date(dueDateObj)
    reminderDate.setDate(reminderDate.getDate() - reminderDays)

    // Don't schedule if reminder date is in the past
    if (reminderDate <= new Date()) {
      console.log("Reminder date is in the past, skipping")
      return null
    }

    const isOwing = debtType === "OWING"
    const title = isOwing ? `💰 Debt Reminder` : `⚠️ Payment Reminder`

    const body = isOwing
      ? `${contactName} owes you ${amount} ${currency}. Due in ${reminderDays} day${reminderDays > 1 ? "s" : ""}.`
      : `Don't forget: You owe ${contactName} ${amount} ${currency}. Due in ${reminderDays} day${reminderDays > 1 ? "s" : ""}.`

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
        },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    })

    console.log("Notification scheduled:", identifier, "for", reminderDate)
    return identifier
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return null
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

    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync()

    // Schedule new notifications
    for (const debt of pendingDebts) {
      await scheduleDebtReminder(debt.debt_id, debt.contact_name, debt.amount, debt.currency || "XAF", debt.due_date, debt.debt_type, settings.days_before_reminder)
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

  if (data.debtId) {
    // Navigation vers le détail de la dette
    console.log("Navigate to debt:", data.debtId)
  }
}
