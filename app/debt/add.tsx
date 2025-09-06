import { PageHeader } from "@/components/feature/page-header"
import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { TextInput } from "@/components/ui/text-input"
import { useTwColors } from "@/lib/tw-colors"
import { createDebt } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Platform, Pressable, TextInput as RNTextInput, Text, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export default function AddDebt() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { twColor } = useTwColors()

  const [form, setForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    amount: "",
    currency: "XAF",
    description: "",
    loan_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours par défaut
    debt_type: "OWING",
  })
  const [loading, setLoading] = useState(false)

  // Refs pour navigation entre inputs
  const contactNameRef = useRef<RNTextInput>(null)
  const contactPhoneRef = useRef<RNTextInput>(null)
  const contactEmailRef = useRef<RNTextInput>(null)
  const amountRef = useRef<RNTextInput>(null)
  const descriptionRef = useRef<RNTextInput>(null)

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const handleDateChange = (field: "loan_date" | "due_date") => (date: Date) => {
    setForm({ ...form, [field]: date })
  }

  const validateForm = () => {
    if (!form.contact_name.trim()) {
      Alert.error("Contact name is required", "Validation Error")
      return false
    }

    if (!form.contact_phone.trim()) {
      Alert.error("Phone number is required", "Validation Error")
      return false
    }

    if (!form.amount.trim()) {
      Alert.error("Amount is required", "Validation Error")
      return false
    }

    const amount = Number(form.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.error("Please enter a valid amount greater than 0", "Validation Error")
      return false
    }

    if (form.due_date < form.loan_date) {
      Alert.error("Due date cannot be before loan date", "Validation Error")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await createDebt({
        user_id: user!.user_id,
        contact_name: form.contact_name.trim(),
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || undefined,
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description.trim() || undefined,
        loan_date: form.loan_date.toISOString(),
        due_date: form.due_date.toISOString(),
        debt_type: form.debt_type as "OWING" | "OWED",
        status: "PENDING",
      })

      // Réinitialiser le formulaire après succès
      setForm({
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        amount: "",
        currency: "",
        description: "",
        loan_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        debt_type: "OWING",
      })

      router.back()
    } catch (error) {
      console.error("Error creating debt:", error)
      Alert.error("Failed to create debt. Please try again.", "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{
        backgroundColor: twColor("background"),
      }}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid
      extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Fixed header */}
      <PageHeader title="New debt" textPosition="center" textAlign="left" />

      <View className="px-6">
        <View className="mt-8 gap-4">
          {/* Debt Type Toggle */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("primary"),
            }}
            className="flex-row justify-around p-1 rounded-xl border"
          >
            <Pressable
              onPress={() => setForm({ ...form, debt_type: "OWING" })}
              style={{
                backgroundColor: form.debt_type === "OWING" ? twColor("primary") : twColor("card-background"),
              }}
              className="flex-1 items-center py-3 rounded-lg"
            >
              <Text
                style={{
                  color: form.debt_type === "OWING" ? twColor("primary-foreground") : twColor("foreground"),
                }}
                className="font-medium"
              >
                Someone owes me
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setForm({ ...form, debt_type: "OWED" })}
              style={{
                backgroundColor: form.debt_type === "OWED" ? twColor("primary") : twColor("card-background"),
              }}
              className="flex-1 items-center py-3 rounded-lg"
            >
              <Text
                style={{
                  color: form.debt_type === "OWED" ? twColor("primary-foreground") : twColor("foreground"),
                }}
                className="font-medium"
              >
                I owe someone
              </Text>
            </Pressable>
          </View>

          {/* Contact Info */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="p-4 rounded-xl shadow-sm border"
          >
            <Text style={{ color: twColor("primary") }} className="text-2xl font-bold mb-4">
              Contact Information
            </Text>

            <TextInput
              ref={contactNameRef}
              label="Full Name"
              required
              placeholder="xxx xxx"
              value={form.contact_name}
              onChangeText={(text) => handleChange("contact_name", text)}
              icon="user"
              returnKeyType="next"
              onSubmitEditing={() => contactPhoneRef.current?.focus()}
            />

            <TextInput
              ref={contactPhoneRef}
              label="Phone Number"
              placeholder="xxx xxx xxx"
              value={form.contact_phone}
              onChangeText={(text) => handleChange("contact_phone", text)}
              keyboardType="phone-pad"
              icon="phone"
              required
              returnKeyType="next"
              onSubmitEditing={() => contactEmailRef.current?.focus()}
            />

            <TextInput
              ref={contactEmailRef}
              label="Email"
              placeholder="xxx@xxx.xx"
              value={form.contact_email}
              onChangeText={(text) => handleChange("contact_email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              containerClassName="mb-0"
              returnKeyType="next"
              onSubmitEditing={() => amountRef.current?.focus()}
            />
          </View>

          {/* Debt Details */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="p-4 rounded-xl shadow-sm border"
          >
            <Text style={{ color: twColor("primary") }} className="text-2xl font-bold mb-4">
              Debt Details
            </Text>

            <TextInput
              ref={amountRef}
              label="Amount"
              required
              placeholder="xxx"
              value={form.amount}
              onChangeText={(text) => handleChange("amount", text)}
              keyboardType="numeric"
              icon="credit-card"
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />

            <SelectInput
              label="Currency"
              value={form.currency}
              onChange={(val) => handleChange("currency", val)}
              options={[
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" },
                { label: "GBP (£)", value: "GBP" },
                { label: "XAF (CFA)", value: "XAF" },
              ]}
            />

            <DateInput label="Loan Date" value={form.loan_date} onChange={handleDateChange("loan_date")} maximumDate={new Date()} required />

            <DateInput label="Due Date" value={form.due_date} onChange={handleDateChange("due_date")} minimumDate={form.loan_date} required />

            <TextInput
              ref={descriptionRef}
              label="Description"
              placeholder="Loan for car repair"
              value={form.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              numberOfLines={3}
              icon="file-text"
              containerClassName="mb-0"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: twColor("primary"),
              opacity: loading ? 0.7 : 1,
            }}
            className="p-4 rounded-xl flex-row gap-2 justify-center items-center"
          >
            {loading ? <Loader /> : <Feather name="navigation" size={20} color={twColor("white")} />}
            <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold text-lg">
              {loading ? "Saving..." : "Save Debt"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}
