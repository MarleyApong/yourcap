import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import {
  generateExportData,
  generateTemplateData,
  importDebtsFromCSV,
  importDebtsFromFile,
  parseCSV,
  shareExportData,
  validateImportData,
} from "@/services/importExportService"
import { Feather } from "@expo/vector-icons"
import React, { useState } from "react"
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { DataStructureModal } from "./data-structure-modal"

interface ImportExportSectionProps {
  userId: string
  onImportComplete?: (imported: number, total: number) => void
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({ userId, onImportComplete }) => {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvInput, setCsvInput] = useState("")

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await generateExportData(userId)
      if (result.success && result.csvData) {
        await shareExportData(result.csvData)
        Toast.success(t("importExport.export.success"))
      } else {
        Toast.error(result.error || t("importExport.export.error"))
      }
    } catch {
      Toast.error(t("importExport.export.dataError"))
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const templateData = generateTemplateData()
      await shareExportData(templateData, "yourcap_template.csv")
      Toast.success(t("importExport.import.templateSuccess"))
    } catch {
      Toast.error(t("importExport.import.templateError"))
    }
  }

  const handleImportFromFile = async () => {
    setLoading(true)
    try {
      const result = await importDebtsFromFile(userId)
      if (result.success) {
        Toast.success(`${result.imported}/${result.total} ${t("importExport.import.importedFromFile")}`)
        onImportComplete?.(result.imported, result.total)
        if (result.errors.length > 0) {
          Alert.alert(
            t("importExport.import.importCompletedWarnings"),
            `${t("importExport.import.errorsEncountered")}\n${result.errors.slice(0, 5).join("\n")}${result.errors.length > 5 ? "\n..." : ""}`
          )
        }
      } else {
        Toast.error(t("importExport.import.importFileError"))
        if (result.errors.length > 0) {
          Alert.alert(t("importExport.import.importErrors"), result.errors.slice(0, 5).join("\n"))
        }
      }
    } catch {
      Toast.error(t("importExport.import.importFileGeneralError"))
    } finally {
      setLoading(false)
    }
  }

  const proceedWithImport = async (csvContent: string) => {
    try {
      const result = await importDebtsFromCSV(userId, csvContent)
      if (result.success) {
        Toast.success(`${result.imported}/${result.total} ${t("importExport.import.importedSuccess")}`)
        setCsvInput("")
        setShowImportModal(false)
        onImportComplete?.(result.imported, result.total)
        if (result.errors.length > 0) {
          Alert.alert(
            t("importExport.import.importCompletedWarnings"),
            `${t("importExport.import.errorsEncountered")}\n${result.errors.slice(0, 5).join("\n")}${result.errors.length > 5 ? "\n..." : ""}`
          )
        }
      } else {
        Toast.error(t("importExport.import.importTextError"))
        if (result.errors.length > 0) {
          Alert.alert(t("importExport.import.importErrors"), result.errors.slice(0, 5).join("\n"))
        }
      }
    } catch {
      Toast.error(t("importExport.import.importGeneralError"))
    }
  }

  const handleImportFromText = async () => {
    if (!csvInput.trim()) {
      Toast.error(t("importExport.import.pleaseEnterCSV"))
      return
    }
    setLoading(true)
    try {
      const parsedData = parseCSV(csvInput)
      const { valid, invalid } = validateImportData(parsedData)
      if (invalid.length > 0) {
        const errorMessage = invalid
          .slice(0, 3)
          .map((item) => `${t("importExport.import.line")} ${item.index}: ${item.errors.join(", ")}`)
          .join("\n")
        Alert.alert(
          t("importExport.import.validationErrors"),
          `${invalid.length} ${t("importExport.import.validationMessage")}\n${errorMessage}${invalid.length > 3 ? "\n..." : ""}\n\n${t("importExport.import.continueWithValid")} ${valid.length} ${t("importExport.import.validLines")}`,
          [
            { text: t("importExport.import.cancelButton"), style: "cancel" },
            { text: t("importExport.import.continueButton"), onPress: () => proceedWithImport(csvInput) },
          ]
        )
      } else {
        await proceedWithImport(csvInput)
      }
    } catch {
      Toast.error(t("importExport.import.errors.invalidCSVFormat"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Export */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
          {t("importExport.export.sectionTitle")}
        </Text>
        <Text style={[styles.sectionDesc, { color: colors.muted.foreground }]}>
          {t("importExport.export.description")}
        </Text>
        <Pressable
          onPress={handleExport}
          disabled={loading}
          style={[styles.btn, { backgroundColor: loading ? colors.muted.default : colors.primary.default }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary.foreground} />
          ) : (
            <Feather name="download" size={16} color={colors.primary.foreground} />
          )}
          <Text style={[styles.btnText, { color: colors.primary.foreground }]}>
            {t("importExport.export.button")}
          </Text>
        </Pressable>
      </View>

      {/* Import */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
          {t("importExport.import.sectionTitle")}
        </Text>
        <Text style={[styles.sectionDesc, { color: colors.muted.foreground }]}>
          {t("importExport.import.description")}
        </Text>

        <View style={styles.row}>
          <Pressable
            onPress={() => setShowStructureModal(true)}
            style={[styles.halfBtn, { backgroundColor: colors.secondary.default }]}
          >
            <Feather name="info" size={14} color={colors.secondary.foreground} />
            <Text style={[styles.halfBtnText, { color: colors.secondary.foreground }]}>
              {t("importExport.import.structureButton")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDownloadTemplate}
            style={[styles.halfBtn, { backgroundColor: colors.secondary.default }]}
          >
            <Feather name="file-text" size={14} color={colors.secondary.foreground} />
            <Text style={[styles.halfBtnText, { color: colors.secondary.foreground }]}>
              {t("importExport.import.templateButton")}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.row, { marginTop: 0 }]}>
          <Pressable
            onPress={() => setShowImportModal(true)}
            style={[styles.halfBtn, { backgroundColor: colors.primary.default }]}
          >
            <Feather name="edit-3" size={16} color={colors.primary.foreground} />
            <Text style={[styles.halfBtnText, { color: colors.primary.foreground }]}>
              {t("importExport.import.pasteCSV")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleImportFromFile}
            disabled={loading}
            style={[styles.halfBtn, { backgroundColor: loading ? colors.muted.default : colors.secondary.default }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.secondary.foreground} />
            ) : (
              <Feather name="upload" size={16} color={colors.secondary.foreground} />
            )}
            <Text style={[styles.halfBtnText, { color: colors.secondary.foreground }]}>
              {t("importExport.import.fileButton")}
            </Text>
          </Pressable>
        </View>
      </View>

      {showStructureModal && (
        <DataStructureModal visible={showStructureModal} onClose={() => setShowStructureModal(false)} />
      )}

      {showImportModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalInner}>
            <View style={[styles.modalCard, { backgroundColor: colors.card.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground.primary }]}>
                  {t("importExport.import.modalTitle")}
                </Text>
                <Pressable onPress={() => { setShowImportModal(false); setCsvInput("") }}>
                  <Feather name="x" size={20} color={colors.foreground.primary} />
                </Pressable>
              </View>
              <Text style={[styles.modalDesc, { color: colors.muted.foreground }]}>
                {t("importExport.import.modalDescription")}
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border,
                    color: colors.foreground.primary,
                  },
                ]}
                placeholder={t("importExport.import.modalPlaceholder")}
                placeholderTextColor={colors.muted.foreground}
                multiline
                textAlignVertical="top"
                value={csvInput}
                onChangeText={setCsvInput}
              />
              <View style={styles.row}>
                <Pressable
                  onPress={() => { setShowImportModal(false); setCsvInput("") }}
                  style={[styles.halfBtn, { backgroundColor: colors.secondary.default }]}
                >
                  <Text style={[styles.halfBtnText, { color: colors.secondary.foreground }]}>
                    {t("importExport.import.modalCancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleImportFromText}
                  disabled={loading || !csvInput.trim()}
                  style={[
                    styles.halfBtn,
                    { backgroundColor: loading || !csvInput.trim() ? colors.muted.default : colors.primary.default },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.primary.foreground} />
                  ) : (
                    <Text style={[styles.halfBtnText, { color: colors.primary.foreground }]}>
                      {t("importExport.import.modalImport")}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionTitle: { fontWeight: "500", marginBottom: 12 },
  sectionDesc: { fontSize: 14, marginBottom: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  btnText: { fontWeight: "500" },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  halfBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  halfBtnText: { fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 50,
  },
  modalInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 448,
    padding: 24,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalDesc: { fontSize: 14, marginBottom: 12 },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    height: 128,
  },
})
