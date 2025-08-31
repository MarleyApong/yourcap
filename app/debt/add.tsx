import { PageHeader } from "@/components/feature/page-header"
import { TextInput } from "@/components/ui/text-input"
import { useAuth } from "@/hooks/useAuth"
import { useTwColors } from "@/lib/tw-colors"
import { createDebt } from "@/services/debtServices"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Pressable, Text, View, TextInput as RNTextInput, Platform } from "react-native"
import Toast from "react-native-toast-message"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { DateInput } from "@/components/ui/date-input"
import { Feather } from "@expo/vector-icons"
import { Loader } from "@/components/ui/loader"

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
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Contact name is required",
      })
      return false
    }

    if (!form.contact_phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Phone number is required",
      })
      return false
    }

    if (!form.amount.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Amount is required",
      })
      return false
    }

    const amount = Number(form.amount)
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid amount greater than 0",
      })
      return false
    }

    if (form.due_date < form.loan_date) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Due date cannot be before loan date",
      })
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
        description: "",
        loan_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        debt_type: "OWING",
      })

      // Retourner au dashboard (qui se rafraîchira automatiquement avec useFocusEffect)
      router.back()
    } catch (error) {
      console.error("Error creating debt:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create debt. Please try again.",
      })
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
