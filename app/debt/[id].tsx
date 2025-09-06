import { PageHeader } from "@/components/feature/page-header"
import { DateInput } from "@/components/ui/date-input"
import { Loader } from "@/components/ui/loader"
import { SelectInput } from "@/components/ui/select-input"
import { TextInput } from "@/components/ui/text-input"
import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteDebt, getDebtById, updateDebt } from "@/services/debtServices"
import { useAuthStore } from "@/stores/authStore"
import { Debt, DebtStatus } from "@/types/debt"
import { Feather } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export default function DebtDetails() {
  const { id } = useLocalSearchParams()
  const { user } = useAuthStore()
  const [debt, setDebt] = useState<Debt | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    amount: "",
    currency: "XAF",
    description: "",
    loan_date: new Date(),
    due_date: new Date(),
    debt_type: "OWING" as "OWING" | "OWED",
  })
  const router = useRouter()
  const { twColor } = useTwColors()

  useEffect(() => {
    if (user && user.user_id) {
      loadDebt()
    } else {
      router.replace("/auth/login")
    }
  }, [id, user])

  const loadDebt = async () => {
    if (!user) return

    try {
      setLoading(true)
      const debtData = await getDebtById(id as string)

      if (debtData && debtData.user_id === user.user_id) {
        setDebt(debtData)
        // Pré-remplir le formulaire d'édition
        setEditForm({
          contact_name: debtData.contact_name,
          contact_phone: debtData.contact_phone || "",
          contact_email: debtData.contact_email || "",
          amount: debtData.amount.toString(),
          currency: debtData.currency || "XAF",
          description: debtData.description || "",
          loan_date: new Date(debtData.loan_date),
          due_date: new Date(debtData.due_date),
          debt_type: debtData.debt_type,
        })
      } else {
        Alert.error("Debt not found or access denied", "Error")
        router.back()
      }
    } catch (error) {
      Alert.error("Failed to load debt details", "Error")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: DebtStatus) => {
    try {
      await updateDebt(debt!.debt_id, { status: newStatus })
      loadDebt()
      Alert.success("Debt status updated", "Success")
    } catch (error) {
      Alert.error("Failed to update status", "Error")
    }
  }

  const handleDelete = () => {
    Alert.confirm(
      "Are you sure you want to delete this debt record?",
      async () => {
        try {
          await deleteDebt(debt!.debt_id)
          Alert.success("Debt deleted successfully", "Success")
          router.back()
        } catch (error) {
          Alert.error("Failed to delete debt", "Error")
        }
      },
      {
        title: "Confirm Delete",
        confirmText: "Delete",
        cancelText: "Cancel",
      },
    )
  }

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleEditDateChange = (field: "loan_date" | "due_date") => (date: Date) => {
    setEditForm({ ...editForm, [field]: date })
  }

  const validateEditForm = () => {
    if (!editForm.contact_name.trim()) {
      Alert.error("Contact name is required", "Validation Error")
      return false
    }

    if (!editForm.contact_phone.trim()) {
      Alert.error("Phone number is required", "Validation Error")
      return false
    }

    if (!editForm.amount.trim()) {
      Alert.error("Amount is required", "Validation Error")
      return false
    }

    const amount = Number(editForm.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.error("Please enter a valid amount greater than 0", "Validation Error")
      return false
    }

    if (editForm.due_date < editForm.loan_date) {
      Alert.error("Due date cannot be before loan date", "Validation Error")
      return false
    }

    return true
  }

  const handleEditSubmit = async () => {
    if (!validateEditForm()) return

    setEditLoading(true)
    try {
      await updateDebt(debt!.debt_id, {
        contact_name: editForm.contact_name.trim(),
        contact_phone: editForm.contact_phone.trim(),
        contact_email: editForm.contact_email.trim() || undefined,
        amount: Number(editForm.amount),
        currency: editForm.currency,
        description: editForm.description.trim() || undefined,
        loan_date: editForm.loan_date.toISOString(),
        due_date: editForm.due_date.toISOString(),
        debt_type: editForm.debt_type,
      })

      Alert.success("Debt updated successfully", "Success")
      setEditModalVisible(false)
      loadDebt()
    } catch (error) {
      console.error("Error updating debt:", error)
      Alert.error("Failed to update debt. Please try again.", "Error")
    } finally {
      setEditLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (debt?.status) {
      case "PAID":
        return twColor("success")
      case "OVERDUE":
        return twColor("destructive")
      default:
        return twColor("warning")
    }
  }

  const getTypeText = () => {
    return debt?.debt_type === "OWING" ? "Owes you" : "You owe"
  }

  const getTypeColor = () => {
    return debt?.debt_type === "OWING" ? twColor("success") : twColor("destructive")
  }

  if (loading || !debt) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: twColor("background") }}>
        <Text style={{ color: twColor("foreground") }}>Loading...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: twColor("background") }}>
      <PageHeader title="Details debt" textPosition="center" textAlign="left" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Header */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="p-4 rounded-xl shadow-sm border mb-6"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold">
                  {debt.contact_name}
                </Text>
                <Text style={{ color: getTypeColor() }} className="text-xl font-semibold mt-1">
                  {getTypeText()} {formatCurrency(debt.amount, debt.currency || user?.settings?.currency)}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: twColor("background"),
                  borderColor: twColor("border"),
                }}
                className="flex-row items-center px-3 py-1 rounded-full border"
              >
                <View style={{ backgroundColor: getStatusColor() }} className="w-3 h-3 rounded-full mr-2" />
                <Text style={{ color: twColor("foreground") }} className="capitalize">
                  {debt.status.toLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <View
            style={{
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border"),
            }}
            className="p-6 rounded-xl shadow-sm border"
          >
            <View className="mb-6">
              <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                Due Date
              </Text>
              <Text style={{ color: twColor("foreground") }} className="text-lg mt-1">
                {formatDate(debt.due_date)}
              </Text>
            </View>

            {debt.contact_phone && (
              <View className="mb-6">
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  Phone Number
                </Text>
                <Text style={{ color: twColor("foreground") }} className="text-lg mt-1">
                  {debt.contact_phone}
                </Text>
              </View>
            )}

            {debt.contact_email && (
              <View className="mb-6">
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  Email
                </Text>
                <Text style={{ color: twColor("foreground") }} className="text-lg mt-1">
                  {debt.contact_email}
                </Text>
              </View>
            )}

            {debt.description && (
              <View className="mb-6">
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  Description
                </Text>
                <Text style={{ color: twColor("foreground") }} className="text-lg mt-1">
                  {debt.description}
                </Text>
              </View>
            )}

            <View>
              <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                Created On
              </Text>
              <Text style={{ color: twColor("foreground") }} className="text-lg mt-1">
                {formatDate(debt.created_at)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-8 gap-2">
            {debt.status !== "PAID" && (
              <Pressable onPress={() => handleStatusChange("PAID")} style={{ backgroundColor: twColor("success") }} className="p-4 rounded-xl">
                <Text style={{ color: twColor("success-foreground") }} className="text-center font-semibold text-lg">
                  Mark as Paid
                </Text>
              </Pressable>
            )}

            {debt.status !== "OVERDUE" && (
              <Pressable onPress={() => handleStatusChange("OVERDUE")} style={{ backgroundColor: twColor("warning") }} className="p-4 rounded-xl">
                <Text style={{ color: twColor("warning-foreground") }} className="text-center font-semibold text-lg">
                  Mark as Overdue
                </Text>
              </Pressable>
            )}

            <Pressable onPress={() => setEditModalVisible(true)} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl">
              <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold text-lg">
                Edit Debt
              </Text>
            </Pressable>

            <Pressable onPress={handleDelete} style={{ backgroundColor: twColor("destructive") }} className="p-4 rounded-xl">
              <Text style={{ color: twColor("destructive-foreground") }} className="text-center font-semibold text-lg">
                Delete Debt
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal animationType="slide" transparent={false} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View className="flex-1" style={{ backgroundColor: twColor("background") }}>
          {/* Header du modal */}
          <View
            style={{
              backgroundColor: twColor("header-background"),
              borderBottomColor: twColor("border"),
            }}
            className="px-6 py-4 flex-row items-center justify-between border-b"
          >
            <Text style={{ color: twColor("header-foreground") }} className="text-xl font-bold">
              Edit Debt
            </Text>
            <Pressable onPress={() => setEditModalVisible(false)}>
              <Feather name="x" size={24} color={twColor("foreground")} />
            </Pressable>
          </View>

          <KeyboardAwareScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            enableOnAndroid
            extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                    onPress={() => handleEditChange("debt_type", "OWING")}
                    style={{
                      backgroundColor: editForm.debt_type === "OWING" ? twColor("primary") : twColor("card-background"),
                    }}
                    className="flex-1 items-center py-3 rounded-lg"
                  >
                    <Text
                      style={{
                        color: editForm.debt_type === "OWING" ? twColor("primary-foreground") : twColor("foreground"),
                      }}
                      className="font-medium"
                    >
                      Someone owes me
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleEditChange("debt_type", "OWED")}
                    style={{
                      backgroundColor: editForm.debt_type === "OWED" ? twColor("primary") : twColor("card-background"),
                    }}
                    className="flex-1 items-center py-3 rounded-lg"
                  >
                    <Text
                      style={{
                        color: editForm.debt_type === "OWED" ? twColor("primary-foreground") : twColor("foreground"),
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
                    label="Full Name"
                    required
                    placeholder="xxx xxx"
                    value={editForm.contact_name}
                    onChangeText={(text) => handleEditChange("contact_name", text)}
                    icon="user"
                  />

                  <TextInput
                    label="Phone Number"
                    placeholder="xxx xxx xxx"
                    value={editForm.contact_phone}
                    onChangeText={(text) => handleEditChange("contact_phone", text)}
                    keyboardType="phone-pad"
                    icon="phone"
                    required
                  />

                  <TextInput
                    label="Email"
                    placeholder="xxx@xxx.xx"
                    value={editForm.contact_email}
                    onChangeText={(text) => handleEditChange("contact_email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail"
                    containerClassName="mb-0"
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
                    label="Amount"
                    required
                    placeholder="xxx"
                    value={editForm.amount}
                    onChangeText={(text) => handleEditChange("amount", text)}
                    keyboardType="numeric"
                    icon="credit-card"
                  />

                  <SelectInput
                    label="Currency"
                    value={editForm.currency}
                    onChange={(val) => handleEditChange("currency", val)}
                    options={[
                      { label: "USD ($)", value: "USD" },
                      { label: "EUR (€)", value: "EUR" },
                      { label: "GBP (£)", value: "GBP" },
                      { label: "XAF (CFA)", value: "XAF" },
                    ]}
                  />

                  <DateInput label="Loan Date" value={editForm.loan_date} onChange={handleEditDateChange("loan_date")} maximumDate={new Date()} required />

                  <DateInput label="Due Date" value={editForm.due_date} onChange={handleEditDateChange("due_date")} minimumDate={editForm.loan_date} required />

                  <TextInput
                    label="Description"
                    placeholder="Loan for car repair"
                    value={editForm.description}
                    onChangeText={(text) => handleEditChange("description", text)}
                    multiline
                    numberOfLines={3}
                    icon="file-text"
                    containerClassName="mb-0"
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleEditSubmit}
                  disabled={editLoading}
                  style={{
                    backgroundColor: twColor("primary"),
                    opacity: editLoading ? 0.7 : 1,
                  }}
                  className="p-4 rounded-xl flex-row gap-2 justify-center items-center"
                >
                  {editLoading ? <Loader /> : <Feather name="save" size={20} color={twColor("primary-foreground")} />}
                  <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold text-lg">
                    {editLoading ? "Saving..." : "Save Changes"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  )
}
