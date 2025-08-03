import { FBackButton } from "@/components/ui/fback-button"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteDebt, getDebtById, updateDebt } from "@/services/debtServices"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import Toast from "react-native-toast-message"

export default function DebtDetails() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const [debt, setDebt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { twColor } = useTwColors()

  useEffect(() => {
    loadDebt()
  }, [id])

  const loadDebt = async () => {
    try {
      setLoading(true)
      const debtData = await getDebtById(id as string)
      if (debtData && debtData.user_id === user?.token) {
        setDebt(debtData)
      } else {
        router.back()
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load debt details",
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDebt(debt.debt_id, { status: newStatus })
      loadDebt()
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Debt status updated",
      })
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update status",
      })
    }
  }

  const handleDelete = () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this debt record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDebt(debt.debt_id)
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Debt deleted successfully",
            })
            router.back()
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to delete debt",
            })
          }
        },
      },
    ])
  }

  const getStatusColor = () => {
    switch (debt?.status) {
      case "PAID":
        return "bg-green-500"
      case "OVERDUE":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getTypeText = () => {
    return debt?.debt_type === "OWING" ? "Owes you" : "You owe"
  }

  const getTypeColor = () => {
    return debt?.debt_type === "OWING" ? "text-green-600" : "text-red-600"
  }

  if (loading || !debt) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      <FBackButton />

      <View className="p-6">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">{debt.contact_name}</Text>
            <Text className={`text-xl font-semibold mt-1 ${getTypeColor()}`}>
              {getTypeText()} {formatCurrency(debt.amount)}
            </Text>
          </View>

          <View className="flex-row items-center bg-white px-3 py-1 rounded-full">
            <View className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`} />
            <Text className="text-gray-700 capitalize">{debt.status.toLowerCase()}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View className="bg-white p-6 rounded-xl shadow-sm">
          <View className="mb-6">
            <Text className="text-sm text-gray-500">Due Date</Text>
            <Text className="text-lg text-gray-900 mt-1">{formatDate(debt.due_date)}</Text>
          </View>

          {debt.contact_phone && (
            <View className="mb-6">
              <Text className="text-sm text-gray-500">Phone Number</Text>
              <Text className="text-lg text-gray-900 mt-1">{debt.contact_phone}</Text>
            </View>
          )}

          {debt.contact_email && (
            <View className="mb-6">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-lg text-gray-900 mt-1">{debt.contact_email}</Text>
            </View>
          )}

          {debt.description && (
            <View className="mb-6">
              <Text className="text-sm text-gray-500">Description</Text>
              <Text className="text-lg text-gray-900 mt-1">{debt.description}</Text>
            </View>
          )}

          <View>
            <Text className="text-sm text-gray-500">Created On</Text>
            <Text className="text-lg text-gray-900 mt-1">{formatDate(debt.created_at)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-8 space-y-4">
          {debt.status !== "PAID" && (
            <Pressable onPress={() => handleStatusChange("PAID")} className="bg-green-500 p-4 rounded-xl">
              <Text className="text-center text-white font-semibold text-lg">Mark as Paid</Text>
            </Pressable>
          )}

          {debt.status !== "OVERDUE" && (
            <Pressable onPress={() => handleStatusChange("OVERDUE")} className="bg-yellow-500 p-4 rounded-xl">
              <Text className="text-center text-white font-semibold text-lg">Mark as Overdue</Text>
            </Pressable>
          )}

          <Pressable onPress={() => router.push(`/debt/add?edit=${debt.debt_id}`)} className="bg-primary p-4 rounded-xl">
            <Text className="text-center text-white font-semibold text-lg">Edit Debt</Text>
          </Pressable>

          <Pressable onPress={handleDelete} className="bg-red-500 p-4 rounded-xl">
            <Text className="text-center text-white font-semibold text-lg">Delete Debt</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
