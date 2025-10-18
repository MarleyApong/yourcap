import { useTwColors } from '@/lib/tw-colors'
import { DATA_STRUCTURE_INFO } from '@/services/importExportService'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

interface DataStructureModalProps {
  visible: boolean
  onClose: () => void
}

export const DataStructureModal: React.FC<DataStructureModalProps> = ({ visible, onClose }) => {
  const { twColor } = useTwColors()

  if (!visible) return null

  return (
    <View className="flex-1" style={{ backgroundColor: twColor("background") }}>
      <View className="px-6 pb-4 pt-14 border-b" style={{ borderBottomColor: twColor("border") }}>
        <View className="flex-row items-center justify-between">
          <Text style={{ color: twColor("foreground") }} className="text-xl font-bold">
            Structure des Données
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <Feather name="x" size={24} color={twColor("foreground")} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Format de fichier */}
        <View className="mb-6">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-2">
            📄 Format de Fichier
          </Text>
          <Text style={{ color: twColor("muted-foreground") }} className="text-base">
            Format supporté : <Text className="font-medium">{DATA_STRUCTURE_INFO.fileFormat}</Text> (Comma-Separated Values)
          </Text>
        </View>

        {/* Champs obligatoires */}
        <View className="mb-6">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-3">
            ✅ Champs Obligatoires
          </Text>
          {DATA_STRUCTURE_INFO.requiredFields.map((field) => (
            <View key={field} className="mb-2">
              <Text style={{ color: twColor("foreground") }} className="font-medium">
                • {field}
              </Text>
              <Text style={{ color: twColor("muted-foreground") }} className="text-sm ml-4">
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Champs optionnels */}
        <View className="mb-6">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-3">
            ➕ Champs Optionnels
          </Text>
          {DATA_STRUCTURE_INFO.optionalFields.map((field) => (
            <View key={field} className="mb-2">
              <Text style={{ color: twColor("foreground") }} className="font-medium">
                • {field}
              </Text>
              <Text style={{ color: twColor("muted-foreground") }} className="text-sm ml-4">
                {DATA_STRUCTURE_INFO.dataTypes[field]}
              </Text>
            </View>
          ))}
        </View>

        {/* Valeurs valides */}
        <View className="mb-6">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-3">
            📋 Valeurs Valides
          </Text>
          
          <View className="mb-4">
            <Text style={{ color: twColor("foreground") }} className="font-medium mb-2">
              Status (statut) :
            </Text>
            {DATA_STRUCTURE_INFO.validStatuses.map((status) => (
              <Text key={status} style={{ color: twColor("muted-foreground") }} className="text-sm ml-4">
                • <Text className="font-medium">{status}</Text> - {getStatusDescription(status)}
              </Text>
            ))}
          </View>

          <View className="mb-4">
            <Text style={{ color: twColor("foreground") }} className="font-medium mb-2">
              Debt Type (type de dette) :
            </Text>
            {DATA_STRUCTURE_INFO.validDebtTypes.map((type) => (
              <Text key={type} style={{ color: twColor("muted-foreground") }} className="text-sm ml-4">
                • <Text className="font-medium">{type}</Text> - {getDebtTypeDescription(type)}
              </Text>
            ))}
          </View>
        </View>

        {/* Exemple de données */}
        <View className="mb-6">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-3">
            💡 Exemple de Données
          </Text>
          
          <View 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: twColor("card-background"),
              borderColor: twColor("border")
            }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* En-têtes */}
                <View className="flex-row border-b pb-2 mb-2" style={{ borderBottomColor: twColor("border") }}>
                  {Object.keys(DATA_STRUCTURE_INFO.dataTypes).map((header) => (
                    <Text 
                      key={header}
                      style={{ color: twColor("foreground") }} 
                      className="font-medium text-xs w-24 mr-2"
                    >
                      {header}
                    </Text>
                  ))}
                </View>
                
                {/* Données d'exemple */}
                {DATA_STRUCTURE_INFO.examples.map((example, index) => (
                  <View key={index} className="flex-row mb-1">
                    {Object.entries(example).map(([key, value]) => (
                      <Text 
                        key={key}
                        style={{ color: twColor("muted-foreground") }} 
                        className="text-xs w-24 mr-2"
                        numberOfLines={1}
                      >
                        {String(value)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Instructions importantes */}
        <View className="mb-8">
          <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mb-3">
            ⚠️ Instructions Importantes
          </Text>
          
          <View className="space-y-2">
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • La première ligne du fichier CSV doit contenir les noms des colonnes (en-têtes)
            </Text>
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • Les dates doivent être au format YYYY-MM-DD (ex: 2024-01-15)
            </Text>
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • Les montants doivent être des nombres (ex: 50000, pas 50,000)
            </Text>
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • Les champs optionnels peuvent être laissés vides
            </Text>
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • Si un champ contient des virgules, entourez-le de guillemets ("...")
            </Text>
            <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
              • L'encodage du fichier doit être UTF-8
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bouton de fermeture */}
      <View className="p-6 border-t" style={{ borderTopColor: twColor("border") }}>
        <Pressable 
          onPress={onClose}
          style={{ backgroundColor: twColor("primary") }} 
          className="p-4 rounded-xl"
        >
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            J'ai Compris
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const getStatusDescription = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'En attente de paiement'
    case 'PAID': return 'Payé/Remboursé'
    case 'OVERDUE': return 'En retard'
    default: return ''
  }
}

const getDebtTypeDescription = (type: string): string => {
  switch (type) {
    case 'OWING': return 'Quelqu\'un vous doit de l\'argent'
    case 'OWED': return 'Vous devez de l\'argent à quelqu\'un'
    default: return ''
  }
}