import { useTwColors } from "@/lib/tw-colors"
import { formatCurrency } from "@/lib/utils"
import { Debt } from "@/types/debt"
import { Pressable, Text, View } from "react-native"

interface DebtItemProps {
  debt: Debt
  currency?: string
  onPress: () => void
  showBorder: boolean
}

export const DebtItem = ({ debt, currency, onPress, showBorder }: DebtItemProps) => {
  const { twColor } = useTwColors()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return twColor("success")
      case "OVERDUE":
        return twColor("destructive")
      default:
        return twColor("warning")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return twColor("badge-bg-1")
      case "OVERDUE":
        return twColor("badge-bg-5")
      default:
        return twColor("badge-bg-3")
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PAID":
        return twColor("badge-fg-1")
      case "OVERDUE":
        return twColor("badge-fg-5")
      default:
        return twColor("badge-fg-3")
    }
  }

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderBottomColor: showBorder ? twColor("border") : "transparent",
      }}
      className={`p-4 ${showBorder ? "border-b" : ""}`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text style={{ color: twColor("foreground") }} className="font-semibold">
            {debt.contact_name}
          </Text>
          <Text style={{ color: twColor("muted-foreground") }} className="text-sm mt-1">
            {debt.debt_type === "OWING" ? "Owes you" : "You owe"} {formatCurrency(debt.amount, currency)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View style={{ backgroundColor: getStatusColor(debt.status) }} className="w-3 h-3 rounded-full mr-3" />
          <View
            style={{
              backgroundColor: getStatusBadgeColor(debt.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: getStatusTextColor(debt.status) }} className="text-xs font-medium capitalize">
              {debt.status.toLowerCase()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
