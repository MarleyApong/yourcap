import { useTwColors } from "@/lib/tw-colors"
import { Text, View } from "react-native"

interface SummaryCardProps {
  label: string
  amount: string
  type: "positive" | "negative" | "neutral"
}

export const SummaryCard = ({ label, amount, type }: SummaryCardProps) => {
  const { twColor } = useTwColors()

  const getAmountColor = () => {
    switch (type) {
      case "positive":
        return twColor("success")
      case "negative":
        return twColor("destructive")
      default:
        return twColor("foreground")
    }
  }

  return (
    <View
      style={{
        backgroundColor: twColor("card-background"),
        borderColor: twColor("border"),
      }}
      className="p-4 rounded-xl shadow-sm w-[30%] items-center border"
    >
      <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
        {label}
      </Text>
      <Text style={{ color: getAmountColor() }} className="text-xl font-bold mt-1">
        {amount}
      </Text>
    </View>
  )
}
