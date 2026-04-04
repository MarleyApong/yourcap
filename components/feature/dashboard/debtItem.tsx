import { useTheme } from "@/core/theme"
import { formatCurrency } from "@/lib/utils"
import { Debt } from "@/types/debt"
import { Pressable, StyleSheet, Text, View } from "react-native"

interface DebtItemProps {
  debt: Debt
  currency?: string
  onPress: () => void
  showBorder: boolean
}

export const DebtItem = ({ debt, currency, onPress, showBorder }: DebtItemProps) => {
  const { colors } = useTheme()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return colors.status.success
      case "OVERDUE":
        return colors.status.destructive
      default:
        return colors.status.warning
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return colors.badge.bg1
      case "OVERDUE":
        return colors.badge.bg5
      default:
        return colors.badge.bg3
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PAID":
        return colors.badge.fg1
      case "OVERDUE":
        return colors.badge.fg5
      default:
        return colors.badge.fg3
    }
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { borderBottomColor: showBorder ? colors.border : "transparent" },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground.primary }]}>{debt.contact_name}</Text>
          <Text style={[styles.sub, { color: colors.muted.foreground }]}>
            {debt.debt_type === "OWING" ? "Owes you" : "You owe"} {formatCurrency(debt.amount, currency)}
          </Text>
        </View>
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: getStatusColor(debt.status) }]} />
          <View style={[styles.badge, { backgroundColor: getStatusBadgeColor(debt.status) }]}>
            <Text style={[styles.badgeText, { color: getStatusTextColor(debt.status) }]}>
              {debt.status.toLowerCase()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
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
    fontWeight: "600",
  },
  sub: {
    fontSize: 14,
    marginTop: 4,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
})
