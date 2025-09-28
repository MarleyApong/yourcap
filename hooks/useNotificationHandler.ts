import { useEffect, useRef } from "react"
import { useRouter } from "expo-router"
import * as Notifications from "expo-notifications"

export const useNotificationHandler = () => {
  const router = useRouter()
  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data

    if (data?.type === "debt_reminder" && data?.debtId) {
      console.log("Navigate to debt:", data.debtId)
      return { route: `/debt/${data.debtId}`, data }
    }

    return null
  }

  useEffect(() => {
    // Listen for notifications while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)
    })

    // Listen for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response)

      const result = handleNotificationResponse(response)
      if (result?.route) {
        router.push(result.route as any)
      }
    })

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [router])
}
