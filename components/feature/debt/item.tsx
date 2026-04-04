import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Link } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"

type Debt = {
  id: string
  name: string
  amount: number
  date: string
  description?: string
}

export default function DebtItem({ debt, type }: { debt: Debt; type: "receive" | "repay" }) {
  const { colors } = useTheme()
  const amountColor = type === "receive" ? colors.status.success : colors.status.destructive
  const icon = type === "receive" ? "arrow-down-left" : "arrow-up-right"

  return (
    <Link href={`/debt/[id]?id=${debt.id}`} asChild>
      <Pressable style={[styles.card, { backgroundColor: colors.card.background }]}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.foreground.primary }]}>{debt.name}</Text>
            {debt.description && (
              <Text style={[styles.description, { color: colors.muted.foreground }]}>{debt.description}</Text>
            )}
            <Text style={[styles.date, { color: colors.muted.foreground }]}>{debt.date}</Text>
          </View>
          <View style={styles.amountRow}>
            <Feather name={icon as any} size={20} color={amountColor} style={styles.icon} />
            <Text style={[styles.amount, { color: amountColor }]}>
              {type === "receive" ? "+" : "-"}${debt.amount}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
})
