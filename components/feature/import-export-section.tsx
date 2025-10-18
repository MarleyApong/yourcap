import { useTranslation } from '@/i18n'
import { useTwColors } from '@/lib/tw-colors'
import {
  generateExportData,
  generateTemplateData,
  importDebtsFromCSV,
  importDebtsFromFile,
  parseCSV,
  shareExportData,
  validateImportData
} from '@/services/importExportService'
import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { DataStructureModal } from './data-structure-modal'

interface ImportExportSectionProps {
  userId: string
  onImportComplete?: (imported: number, total: number) => void
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({ 
  userId, 
  onImportComplete 
}) => {
  const { twColor } = useTwColors()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvInput, setCsvInput] = useState('')

  // Exporter les données utilisateur
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
    } catch (error) {
      Toast.error(t("importExport.export.dataError"))
    } finally {
      setLoading(false)
    }
  }

  // Télécharger le template
  const handleDownloadTemplate = async () => {
    try {
      const templateData = generateTemplateData()
      await shareExportData(templateData, 'yourcap_template.csv')
      Toast.success(t("importExport.import.templateSuccess"))
    } catch (error) {
      Toast.error(t("importExport.import.templateError"))
    }
  }

  // Importer depuis un fichier
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
            `${t("importExport.import.errorsEncountered")}\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? '\n...' : ''}`
          )
        }
      } else {
        Toast.error(t("importExport.import.importFileError"))
        if (result.errors.length > 0) {
          Alert.alert(t("importExport.import.importErrors"), result.errors.slice(0, 5).join('\n'))
        }
      }
    } catch (error) {
      Toast.error(t("importExport.import.importFileGeneralError"))
    } finally {
      setLoading(false)
    }
  }

  // Importer depuis du texte CSV
  const handleImportFromText = async () => {
    if (!csvInput.trim()) {
      Toast.error(t("importExport.import.pleaseEnterCSV"))
      return
    }

    setLoading(true)
    try {
      // Valider d'abord les données
      const parsedData = parseCSV(csvInput)
      const { valid, invalid } = validateImportData(parsedData)

      if (invalid.length > 0) {
        const errorMessage = invalid.slice(0, 3).map(item => 
          `${t("importExport.import.line")} ${item.index}: ${item.errors.join(', ')}`
        ).join('\n')
        
        Alert.alert(
          t("importExport.import.validationErrors"),
          `${invalid.length} ${t("importExport.import.validationMessage")}\n${errorMessage}${invalid.length > 3 ? '\n...' : ''}\n\n${t("importExport.import.continueWithValid")} ${valid.length} ${t("importExport.import.validLines")}`,
          [
            { text: t("importExport.import.cancelButton"), style: "cancel" },
            { 
              text: t("importExport.import.continueButton"), 
              onPress: () => proceedWithImport(csvInput)
            }
          ]
        )
      } else {
        await proceedWithImport(csvInput)
      }
    } catch (error) {
      Toast.error(t("importExport.import.errors.invalidCSVFormat"))
    } finally {
      setLoading(false)
    }
  }

  const proceedWithImport = async (csvContent: string) => {
    try {
      const result = await importDebtsFromCSV(userId, csvContent)
      
      if (result.success) {
        Toast.success(`${result.imported}/${result.total} ${t("importExport.import.importedSuccess")}`)
        setCsvInput('')
        setShowImportModal(false)
        onImportComplete?.(result.imported, result.total)
        
        if (result.errors.length > 0) {
          Alert.alert(
            t("importExport.import.importCompletedWarnings"),
            `${t("importExport.import.errorsEncountered")}\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? '\n...' : ''}`
          )
        }
      } else {
        Toast.error(t("importExport.import.importTextError"))
        if (result.errors.length > 0) {
          Alert.alert(t("importExport.import.importErrors"), result.errors.slice(0, 5).join('\n'))
        }
      }
    } catch (error) {
      Toast.error(t("importExport.import.importGeneralError"))
    }
  }

  return (
    <>
      {/* Section Export */}
      <View className="mb-4">
        <Text style={{ color: twColor("foreground") }} className="font-medium mb-3">
          {t("importExport.export.sectionTitle")}
        </Text>
        <Text style={{ color: twColor("muted-foreground") }} className="text-sm mb-3">
          {t("importExport.export.description")}
        </Text>
        
        <Pressable
          onPress={handleExport}
          disabled={loading}
          style={{
            backgroundColor: loading ? twColor("muted") : twColor("primary"),
          }}
          className="flex-row items-center justify-center p-3 rounded-lg mb-2"
        >
          {loading ? (
            <ActivityIndicator size="small" color={twColor("primary-foreground")} />
          ) : (
            <Feather name="download" size={16} color={twColor("primary-foreground")} />
          )}
          <Text style={{ color: twColor("primary-foreground") }} className="font-medium ml-2">
            {t("importExport.export.button")}
          </Text>
        </Pressable>
      </View>

      {/* Section Import */}
      <View className="mb-4">
        <Text style={{ color: twColor("foreground") }} className="font-medium mb-3">
          {t("importExport.import.sectionTitle")}
        </Text>
        <Text style={{ color: twColor("muted-foreground") }} className="text-sm mb-3">
          {t("importExport.import.description")}
        </Text>

        {/* Boutons d'aide */}
        <View className="flex-row gap-2 mb-3">
          <Pressable
            onPress={() => setShowStructureModal(true)}
            style={{ backgroundColor: twColor("secondary") }}
            className="flex-row items-center px-3 py-2 rounded-lg flex-1"
          >
            <Feather name="info" size={14} color={twColor("secondary-foreground")} />
            <Text style={{ color: twColor("secondary-foreground") }} className="text-sm font-medium ml-1">
              {t("importExport.import.structureButton")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDownloadTemplate}
            style={{ backgroundColor: twColor("secondary") }}
            className="flex-row items-center px-3 py-2 rounded-lg flex-1"
          >
            <Feather name="file-text" size={14} color={twColor("secondary-foreground")} />
            <Text style={{ color: twColor("secondary-foreground") }} className="text-sm font-medium ml-1">
              {t("importExport.import.templateButton")}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setShowImportModal(true)}
            style={{ backgroundColor: twColor("primary") }}
            className="flex-row items-center justify-center p-3 rounded-lg flex-1"
          >
            <Feather name="edit-3" size={16} color={twColor("primary-foreground")} />
            <Text style={{ color: twColor("primary-foreground") }} className="font-medium ml-2">
              {t("importExport.import.pasteCSV")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleImportFromFile}
            disabled={loading}
            style={{ 
              backgroundColor: loading ? twColor("muted") : twColor("secondary") 
            }}
            className="flex-row items-center justify-center p-3 rounded-lg flex-1"
          >
            {loading ? (
              <ActivityIndicator size="small" color={twColor("secondary-foreground")} />
            ) : (
              <Feather name="upload" size={16} color={twColor("secondary-foreground")} />
            )}
            <Text style={{ color: twColor("secondary-foreground") }} className="font-medium ml-2">
              {t("importExport.import.fileButton")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Modal de structure de données */}
      {showStructureModal && (
        <DataStructureModal
          visible={showStructureModal}
          onClose={() => setShowStructureModal(false)}
        />
      )}

      {/* Modal d'import */}
      {showImportModal && (
        <View className="absolute inset-0 bg-black bg-opacity-50 z-50">
          <View className="flex-1 justify-center items-center p-6">
            <View 
              className="w-full max-w-md p-6 rounded-xl"
              style={{ backgroundColor: twColor("card-background") }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ color: twColor("foreground") }} className="text-lg font-bold">
                  {t("importExport.import.modalTitle")}
                </Text>
                <Pressable 
                  onPress={() => {
                    setShowImportModal(false)
                    setCsvInput('')
                  }}
                >
                  <Feather name="x" size={20} color={twColor("foreground")} />
                </Pressable>
              </View>

              <Text style={{ color: twColor("muted-foreground") }} className="text-sm mb-3">
                {t("importExport.import.modalDescription")}
              </Text>

              <TextInput
                style={{
                  backgroundColor: twColor("background"),
                  borderColor: twColor("border"),
                  color: twColor("foreground"),
                }}
                className="border rounded-lg p-3 mb-4 h-32"
                placeholder={t("importExport.import.modalPlaceholder")}
                placeholderTextColor={twColor("muted-foreground")}
                multiline
                textAlignVertical="top"
                value={csvInput}
                onChangeText={setCsvInput}
              />

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    setShowImportModal(false)
                    setCsvInput('')
                  }}
                  style={{ backgroundColor: twColor("secondary") }}
                  className="flex-1 p-3 rounded-lg"
                >
                  <Text style={{ color: twColor("secondary-foreground") }} className="text-center font-medium">
                    {t("importExport.import.modalCancel")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleImportFromText}
                  disabled={loading || !csvInput.trim()}
                  style={{
                    backgroundColor: loading || !csvInput.trim() ? twColor("muted") : twColor("primary"),
                  }}
                  className="flex-1 p-3 rounded-lg"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={twColor("primary-foreground")} />
                  ) : (
                    <Text style={{ color: twColor("primary-foreground") }} className="text-center font-medium">
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