import { PageHeader } from "@/components/feature/page-header"
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
    loan_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours par défaut
    debt_type: "OWING",
  })
  const [showLoanDatePicker, setShowLoanDatePicker] = useState(false)
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleDateChange = (field: "loan_date" | "due_date") => (event: any, selectedDate?: Date) => {
    if (field === "loan_date") setShowLoanDatePicker(false)
    if (field === "due_date") setShowDueDatePicker(false)

    if (selectedDate) {
      setForm({ ...form, [field]: selectedDate })
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
        user_id: user!.user_id,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email || undefined,
        amount: Number(form.amount),
        description: form.description,
        loan_date: form.loan_date.toISOString(),
        due_date: form.due_date.toISOString(),
        debt_type: form.debt_type as "OWING" | "OWED",
        status: "PENDING",
      })

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Debt created successfully",
      })

      router.back()
    } catch (error) {
      console.error("Error creating debt:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create debt",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHeader title="New debt" textPosition="center" textAlign="left" backPath="/dashboard" />

      <View className="px-6">
        <View className="mt-8 gap-4">
          {/* Debt Type Toggle */}
          <View className="flex-row justify-around bg-white p-1 rounded-xl border border-primary">
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
            <Text className="text-2xl font-bold text-primary mb-4">Contact Information</Text>

            <TextInput label="Full Name" required placeholder="John Doe" value={form.contact_name} onChangeText={(text) => handleChange("contact_name", text)} icon="user" />

            <TextInput
              label="Phone Number"
              placeholder="123 456 7890"
              value={form.contact_phone}
              onChangeText={(text) => handleChange("contact_phone", text)}
              keyboardType="phone-pad"
              icon="phone"
              required
            />

            <TextInput
              label="Email"
              placeholder="john@example.com"
              value={form.contact_email}
              onChangeText={(text) => handleChange("contact_email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              containerClassName="mb-0"
            />
          </View>

          {/* Debt Details */}
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <Text className="text-2xl font-bold text-primary mb-4">Debt Details</Text>

            <TextInput
              label="Amount"
              required
              placeholder="1000"
              value={form.amount}
              onChangeText={(text) => handleChange("amount", text)}
              keyboardType="numeric"
              icon="credit-card"
            />

            <View className="mb-4">
              <Text className="font-bold text-lg">Loan Date</Text>
              <Pressable onPress={() => setShowLoanDatePicker(true)} className="flex-row items-center justify-between border-b border-primary p-3">
                <View className="flex-row items-center">
                  <Feather name="calendar" size={20} color={twColor("text-primary")} />
                  <Text className="ml-2 text-gray-700">{format(form.loan_date, "MMM dd, yyyy")}</Text>
                </View>
                <Feather name="chevron-down" size={20} color={twColor("text-gray-500")} />
              </Pressable>
            </View>

            <View className="mb-6">
              <Text className="font-bold text-lg">Due Date</Text>
              <Pressable onPress={() => setShowDueDatePicker(true)} className="flex-row items-center justify-between border-b border-primary p-3">
                <View className="flex-row items-center">
                  <Feather name="calendar" size={20} color={twColor("text-primary")} />
                  <Text className="ml-2 text-gray-700">{format(form.due_date, "MMM dd, yyyy")}</Text>
                </View>
                <Feather name="chevron-down" size={20} color={twColor("text-gray-500")} />
              </Pressable>
            </View>

            {showLoanDatePicker && <DateTimePicker value={form.loan_date} mode="date" display="default" onChange={handleDateChange("loan_date")} />}

            {showDueDatePicker && <DateTimePicker value={form.due_date} mode="date" display="default" onChange={handleDateChange("due_date")} minimumDate={new Date()} />}

            <TextInput
              label="Description"
              placeholder="Loan for car repair"
              value={form.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              numberOfLines={3}
              icon="file-text"
              containerClassName="mb-0"
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
