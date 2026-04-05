import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"

interface SheetModalProps {
  visible: boolean
  onClose: () => void
  title: string
  /** Label of the action button at the bottom */
  actionLabel: string
  /** Called when the action button is pressed (before closing) */
  onAction?: () => void
  /** Hide the status bar when the modal is open (default: false) */
  hideStatusBar?: boolean
  children: React.ReactNode
}

export function SheetModal({ visible, onClose, title, actionLabel, onAction, hideStatusBar = false, children }: SheetModalProps) {
  const { colors } = useTheme()

  const handleAction = () => {
    onAction?.()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden={hideStatusBar && visible} animated />
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.background.primary }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.primary.default }]}>{title}</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={colors.foreground.primary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {children}
            <View style={{ height: 24 }} />
          </ScrollView>

          <Pressable
            onPress={handleAction}
            style={[styles.btn, { backgroundColor: colors.primary.default }]}
          >
            <Text style={[styles.btnText, { color: colors.primary.foreground }]}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

/** Shared styles for section content inside a SheetModal */
export const sheetSectionStyles = StyleSheet.create({
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700" as const, flex: 1 },
  sectionContent: { fontSize: 14, lineHeight: 21, marginBottom: 4 },
})

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700" },
  scroll: { paddingHorizontal: 24 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: { fontWeight: "700", fontSize: 16 },
})
