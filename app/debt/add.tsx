import { FBackButton } from "@/components/ui/fback-button"
import { TextInput } from "@/components/ui/text-input"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { createDebt } from "@/services/debtServices"
import { Feather } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import Toast from "react-native-toast-message"

export default function AddDebt() {
  const { user } = useAuth()
  const router = useRouter()
  const { twColor } = useTwColors()

  const [form, setForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    amount: "",
    description: "",
    due_date: new Date(),
    debt_type: "OWING", // 'OWING' or 'OWED'
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setForm({ ...form, due_date: selectedDate })
    }
  }

  const handleSubmit = async () => {
    if (!form.contact_name || !form.contact_phone || !form.amount) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields",
      })
      return
    }

    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid amount",
      })
      return
    }

    setLoading(true)
    try {
      await createDebt({
        user_id: user!.token,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email || undefined,
        amount: Number(form.amount),
        description: form.description,
        due_date: form.due_date.toISOString(),
        debt_type: form.debt_type as "OWING" | "OWED",
        status: "PENDING",
      })

      router.back()
    } catch (error) {
      console.error("Error creating debt:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      <FBackButton />

      <View className="px-6 mt-4">
        <Text className="text-3xl font-bold text-gray-900">Add New Debt</Text>

        <View className="mt-8 space-y-6">
          {/* Debt Type Toggle */}
          <View className="flex-row justify-around bg-white p-1 rounded-xl">
            <Pressable
              onPress={() => setForm({ ...form, debt_type: "OWING" })}
              className={`flex-1 items-center py-3 rounded-lg ${form.debt_type === "OWING" ? "bg-primary" : "bg-white"}`}
            >
              <Text className={`font-medium ${form.debt_type === "OWING" ? "text-white" : "text-gray-700"}`}>Someone owes me</Text>
            </Pressable>
            <Pressable
              onPress={() => setForm({ ...form, debt_type: "OWED" })}
              className={`flex-1 items-center py-3 rounded-lg ${form.debt_type === "OWED" ? "bg-primary" : "bg-white"}`}
            >
              <Text className={`font-medium ${form.debt_type === "OWED" ? "text-white" : "text-gray-700"}`}>I owe someone</Text>
            </Pressable>
          </View>

          {/* Contact Info */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>

            <TextInput label="Full Name *" placeholder="John Doe" value={form.contact_name} onChangeText={(text) => handleChange("contact_name", text)} icon="user" />

            <TextInput
              label="Phone Number *"
              placeholder="612345678"
              value={form.contact_phone}
              onChangeText={(text) => handleChange("contact_phone", text)}
              keyboardType="phone-pad"
              icon="phone"
              className="mt-4"
            />

            <TextInput
              label="Email (optional)"
              placeholder="john@example.com"
              value={form.contact_email}
              onChangeText={(text) => handleChange("contact_email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              className="mt-4"
            />
          </View>

          {/* Debt Details */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Debt Details</Text>

            <TextInput label="Amount *" placeholder="1000" value={form.amount} onChangeText={(text) => handleChange("amount", text)} keyboardType="numeric" icon="dollar-sign" />

            <Pressable onPress={() => setShowDatePicker(true)} className="mt-4 flex-row items-center justify-between bg-gray-100 p-3 rounded-lg">
              <View className="flex-row items-center">
                <Feather name="calendar" size={20} color={twColor("text-gray-500")} />
                <Text className="ml-2 text-gray-700">{form.due_date ? format(form.due_date, "MMM dd, yyyy") : "Select due date"}</Text>
              </View>
              <Feather name="chevron-down" size={20} color={twColor("text-gray-500")} />
            </Pressable>

            {showDatePicker && <DateTimePicker value={form.due_date} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />}

            <TextInput
              label="Description (optional)"
              placeholder="Loan for car repair"
              value={form.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              numberOfLines={3}
              icon="file-text"
              className="mt-4"
            />
          </View>

          {/* Submit Button */}
          <Pressable onPress={handleSubmit} disabled={loading} className={`bg-primary p-4 rounded-xl ${loading ? "opacity-70" : ""}`}>
            <Text className="text-center text-white font-semibold text-lg">{loading ? "Saving..." : "Save Debt"}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
