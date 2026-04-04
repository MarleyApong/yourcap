import { useTheme } from "@/core/theme"
import { DATA_STRUCTURE_INFO } from "@/services/importExportService"
import { Feather } from "@expo/vector-icons"
import React from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

interface DataStructureModalProps {
  visible: boolean
  onClose: () => void
}

export const DataStructureModal: React.FC<DataStructureModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme()

  if (!visible) return null

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground.primary }]}>
          Structure des Données
        </Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.foreground.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Format */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            📄 Format de Fichier
          </Text>
          <Text style={[styles.body, { color: colors.muted.foreground }]}>
            Format supporté :{" "}
            <Text style={styles.bold}>{DATA_STRUCTURE_INFO.fileFormat}</Text> (Comma-Separated Values)
          </Text>
        </View>

        {/* Champs obligatoires */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            ✅ Champs Obligatoires
          </Text>
          {DATA_STRUCTURE_INFO.requiredFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={[styles.fieldName, { color: colors.foreground.primary }]}>• {field}</Text>
              <Text style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Champs optionnels */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            ➕ Champs Optionnels
          </Text>
          {DATA_STRUCTURE_INFO.optionalFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={[styles.fieldName, { color: colors.foreground.primary }]}>• {field}</Text>
              <Text style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Valeurs valides */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            📋 Valeurs Valides
          </Text>
          <Text style={[styles.fieldName, { color: colors.foreground.primary }]}>Status :</Text>
          {DATA_STRUCTURE_INFO.validStatuses.map((status) => (
            <Text key={status} style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
              • <Text style={styles.bold}>{status}</Text> - {getStatusDescription(status)}
            </Text>
          ))}
          <Text style={[styles.fieldName, { color: colors.foreground.primary, marginTop: 16 }]}>
            Debt Type :
          </Text>
          {DATA_STRUCTURE_INFO.validDebtTypes.map((type) => (
            <Text key={type} style={[styles.fieldDesc, { color: colors.muted.foreground }]}>
              • <Text style={styles.bold}>{type}</Text> - {getDebtTypeDescription(type)}
            </Text>
          ))}
        </View>

        {/* Exemple */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            💡 Exemple de Données
          </Text>
          <View style={[styles.exampleBox, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={[styles.exampleHeader, { borderBottomColor: colors.border }]}>
                  {Object.keys(DATA_STRUCTURE_INFO.dataTypes).map((header) => (
                    <Text key={header} style={[styles.exampleCell, styles.exampleHeaderText, { color: colors.foreground.primary }]}>
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

        {/* Instructions */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            ⚠️ Instructions Importantes
          </Text>
          {[
            "La première ligne du fichier CSV doit contenir les noms des colonnes (en-têtes)",
            "Les dates doivent être au format YYYY-MM-DD (ex: 2024-01-15)",
            "Les montants doivent être des nombres (ex: 50000, pas 50,000)",
            "Les champs optionnels peuvent être laissés vides",
            'Si un champ contient des virgules, entourez-le de guillemets ("...")',
            "L'encodage du fichier doit être UTF-8",
          ].map((instruction, i) => (
            <Text key={i} style={[styles.instruction, { color: colors.muted.foreground }]}>
              • {instruction}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable onPress={onClose} style={[styles.closeFooterBtn, { backgroundColor: colors.primary.default }]}>
          <Text style={[styles.closeFooterText, { color: colors.primary.foreground }]}>J'ai Compris</Text>
        </Pressable>
      </View>
    </View>
  )
}

const getStatusDescription = (status: string): string => {
  switch (status) {
    case "PENDING": return "En attente de paiement"
    case "PAID": return "Payé/Remboursé"
    case "OVERDUE": return "En retard"
    default: return ""
  }
}

const getDebtTypeDescription = (type: string): string => {
  switch (type) {
    case "OWING": return "Quelqu'un vous doit de l'argent"
    case "OWED": return "Vous devez de l'argent à quelqu'un"
    default: return ""
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  body: { fontSize: 16 },
  bold: { fontWeight: "600" },
  fieldRow: { marginBottom: 8 },
  fieldName: { fontWeight: "500" },
  fieldDesc: { fontSize: 14, marginLeft: 16 },
  exampleBox: { padding: 16, borderRadius: 8, borderWidth: 1 },
  exampleHeader: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 8, marginBottom: 8 },
  exampleHeaderText: { fontWeight: "500" },
  exampleRow: { flexDirection: "row", marginBottom: 4 },
  exampleCell: { fontSize: 12, width: 96, marginRight: 8 },
  instruction: { fontSize: 14, marginBottom: 8 },
  footer: { padding: 24, borderTopWidth: 1 },
  closeFooterBtn: { padding: 16, borderRadius: 12 },
  closeFooterText: { textAlign: "center", fontWeight: "600" },
})
