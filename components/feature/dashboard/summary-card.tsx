import { useTheme } from "@/core/theme"
import { StyleSheet, Text, View } from "react-native"

interface SummaryCardProps {
  label: string
  amount: string
  type: "positive" | "negative" | "neutral"
}

export const SummaryCard = ({ label, amount, type }: SummaryCardProps) => {
  const { colors } = useTheme()

  const getAmountColor = () => {
    switch (type) {
      case "positive":
        return colors.status.success
      case "negative":
        return colors.status.destructive
      default:
        return colors.foreground.primary
    }
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card.background,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.muted.foreground }]} numberOfLines={2}>{label}</Text>
      <Text style={[styles.amount, { color: getAmountColor() }]}>{amount}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    width: "30%",
    alignItems: "center",
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
    minHeight: 28,
  },
  amount: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
})
