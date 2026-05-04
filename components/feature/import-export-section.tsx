import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { generateBackup, importBackupFromFile, shareBackup } from "@/services/importExportService"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"

interface Props {
  userId: string
  onImportComplete?: (imported: number, total: number) => void
}

export const ImportExportSection: React.FC<Props> = ({ userId, onImportComplete }) => {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const result = await generateBackup(userId)
      if (result.success && result.data) {
        await shareBackup(result.data)
        Toast.success(t("importExport.export.success"))
      } else {
        Toast.error(result.error || t("importExport.export.error"))
      }
    } catch {
      Toast.error(t("importExport.export.error"))
    } finally {
      setExportLoading(false)
    }
  }

  const handleImport = async () => {
    setImportLoading(true)
    try {
      const result = await importBackupFromFile(userId)
      if (result.success) {
        Toast.success(`${result.imported}/${result.total} ${t("importExport.import.importedSuccess")}`)
        onImportComplete?.(result.imported, result.total)
        if (result.errors.length > 0) {
          Toast.warning(`${result.errors.length} ${t("importExport.import.errorsEncountered")}`)
        }
      } else {
        if (result.errors[0] === "Import annulé") return
        Toast.error(result.errors[0] || t("importExport.import.importFileError"))
      }
    } catch {
      Toast.error(t("importExport.import.importFileGeneralError"))
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Export */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary.default + "18" }]}>
            <Feather name="download" size={18} color={colors.primary.default} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>
              {t("importExport.export.sectionTitle")}
            </Text>
            <Text style={[styles.desc, { color: colors.muted.foreground }]}>
              {t("importExport.export.description")}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleExport}
          disabled={exportLoading}
          style={[styles.btn, { backgroundColor: colors.primary.default, opacity: exportLoading ? 0.7 : 1 }]}
        >
          {exportLoading
            ? <ActivityIndicator size="small" color={colors.primary.foreground} />
            : <Feather name="download" size={16} color={colors.primary.foreground} />
          }
          <Text style={[styles.btnText, { color: colors.primary.foreground }]}>
            {t("importExport.export.button")}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Import */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.status.success + "18" }]}>
            <Feather name="upload" size={18} color={colors.status.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>
              {t("importExport.import.sectionTitle")}
            </Text>
            <Text style={[styles.desc, { color: colors.muted.foreground }]}>
              {t("importExport.import.description")}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleImport}
          disabled={importLoading}
          style={[styles.btn, { backgroundColor: colors.status.success, opacity: importLoading ? 0.7 : 1 }]}
        >
          {importLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Feather name="upload" size={16} color="#fff" />
          }
          <Text style={[styles.btnText, { color: "#fff" }]}>
            {t("importExport.import.fileButton")}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.notice, { backgroundColor: colors.muted.default, borderColor: colors.border }]}>
        <Feather name="info" size={13} color={colors.muted.foreground} />
        <Text style={[styles.noticeText, { color: colors.muted.foreground }]}>
          {t("importExport.notice")}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  section: { paddingVertical: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "600", fontSize: 14, marginBottom: 2 },
  desc: { fontSize: 12, lineHeight: 17 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 10,
  },
  btnText: { fontWeight: "600", fontSize: 14 },
  divider: { height: StyleSheet.hairlineWidth },
  notice: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8,
  },
  noticeText: { fontSize: 11, flex: 1, lineHeight: 16 },
})
