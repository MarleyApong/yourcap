import { SheetModal, sheetSectionStyles } from "@/components/feature/sheet-modal"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import {
  DATA_STRUCTURE_INFO,
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
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"

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
          Toast.error(`${result.errors.length} ${t("importExport.import.errorsEncountered")}`)
        }
      } else {
        Toast.error(t("importExport.import.importFileError"))
        if (result.errors.length > 0) {
          Toast.error(`${result.errors.length} ${t("importExport.import.importErrors")}`)
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
          Toast.error(`${result.errors.length} ${t("importExport.import.errorsEncountered")}`)
        }
      } else {
        Toast.error(t("importExport.import.importTextError"))
        if (result.errors.length > 0) {
          Toast.error(`${result.errors.length} ${t("importExport.import.importErrors")}`)
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
        Toast.confirm(
          `${invalid.length} ${t("importExport.import.validationMessage")} — ${t("importExport.import.continueWithValid")} ${valid.length} ${t("importExport.import.validLines")}`,
          () => proceedWithImport(csvInput),
          { title: t("importExport.import.validationErrors"), confirmText: t("importExport.import.continueButton"), cancelText: t("importExport.import.cancelButton") },
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

      {/* Data Structure SheetModal */}
      <SheetModal
        visible={showStructureModal}
        onClose={() => setShowStructureModal(false)}
        title={t("importExport.dataStructure.title")}
        actionLabel={t("settings.iUnderstand")}
        onAction={() => setShowStructureModal(false)}
      >
        <Text style={[sheetSectionStyles.sectionContent, { color: colors.muted.foreground, marginBottom: 16 }]}>
          {t("importExport.dataStructure.description")}
        </Text>

        {/* Required fields */}
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="check-circle" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
              {t("importExport.dataStructure.rules.title")}
            </Text>
          </View>
          {DATA_STRUCTURE_INFO.requiredFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={[styles.fieldName, { color: colors.foreground.primary }]}>• {field}</Text>
              <Text style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Optional fields */}
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="plus-circle" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
              {t("importExport.import.structureButton")}
            </Text>
          </View>
          {DATA_STRUCTURE_INFO.optionalFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={[styles.fieldName, { color: colors.foreground.primary }]}>• {field}</Text>
              <Text style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Type values */}
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="tag" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
              Type
            </Text>
          </View>
          <Text style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
            • <Text style={{ fontWeight: "600" }}>OWING</Text> — {t("importExport.dataStructure.typeValues.owed")}
          </Text>
          <Text style={[styles.fieldDesc, { color: colors.muted.foreground, marginTop: 4 }]}>
            • <Text style={{ fontWeight: "600" }}>OWED</Text> — {t("importExport.dataStructure.typeValues.owe")}
          </Text>
        </View>

        {/* Example */}
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="file-text" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
              {t("importExport.dataStructure.example")}
            </Text>
          </View>
          <View style={[styles.exampleBox, { backgroundColor: colors.background.primary, borderColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={[styles.exampleHeader, { borderBottomColor: colors.border }]}>
                  {Object.keys(DATA_STRUCTURE_INFO.dataTypes).map((header) => (
                    <Text key={header} style={[styles.exampleCell, { color: colors.foreground.primary, fontWeight: "600" }]}>
                      {header}
                    </Text>
                  ))}
                </View>
                {DATA_STRUCTURE_INFO.examples.map((example, index) => (
                  <View key={index} style={styles.exampleRow}>
                    {Object.entries(example).map(([key, value]) => (
                      <Text key={key} style={[styles.exampleCell, { color: colors.muted.foreground }]} numberOfLines={1}>
                        {String(value)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </SheetModal>

      {/* Import from text modal */}
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
  fieldRow: { marginBottom: 6 },
  fieldName: { fontWeight: "500", fontSize: 14 },
  fieldDesc: { fontSize: 13, marginLeft: 12 },
  exampleBox: { padding: 12, borderRadius: 8, borderWidth: 1 },
  exampleHeader: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 6, marginBottom: 6 },
  exampleRow: { flexDirection: "row", marginBottom: 4 },
  exampleCell: { fontSize: 11, width: 96, marginRight: 8 },
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
