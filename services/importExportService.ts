import { DebtInput, DebtStatus, DebtType } from '@/types/debt'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Alert, Platform, Share } from 'react-native'
import { createDebt, getUserDebts } from './debtServices'

// Structure de données pour l'export/import
export interface ExportData {
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  currency: string
  description?: string
  loan_date: string // Format: YYYY-MM-DD
  due_date: string // Format: YYYY-MM-DD
  repayment_date?: string // Format: YYYY-MM-DD
  status: DebtStatus // PENDING | PAID | OVERDUE
  debt_type: DebtType // OWING | OWED
}

// Structure de données avec informations d'import/export
export interface ImportExportInfo {
  fileFormat: 'CSV'
  requiredFields: string[]
  optionalFields: string[]
  dataTypes: Record<string, string>
  examples: ExportData[]
  validStatuses: DebtStatus[]
  validDebtTypes: DebtType[]
}

// Informations complètes sur la structure des données
export const DATA_STRUCTURE_INFO: ImportExportInfo = {
  fileFormat: 'CSV',
  requiredFields: [
    'contact_name',
    'contact_phone', 
    'amount',
    'currency',
    'loan_date',
    'due_date',
    'status',
    'debt_type'
  ],
  optionalFields: [
    'contact_email',
    'description',
    'repayment_date'
  ],
  dataTypes: {
    'contact_name': 'Texte (ex: John Doe)',
    'contact_phone': 'Texte (ex: +237123456789)',
    'contact_email': 'Email (ex: john@example.com)',
    'amount': 'Nombre (ex: 50000)',
    'currency': 'Texte (ex: XAF, EUR, USD)',
    'description': 'Texte (ex: Prêt personnel)',
    'loan_date': 'Date au format YYYY-MM-DD (ex: 2024-01-15)',
    'due_date': 'Date au format YYYY-MM-DD (ex: 2024-02-15)',
    'repayment_date': 'Date au format YYYY-MM-DD (ex: 2024-02-10)',
    'status': 'PENDING | PAID | OVERDUE',
    'debt_type': 'OWING (on vous doit) | OWED (vous devez)'
  },
  validStatuses: ['PENDING', 'PAID', 'OVERDUE'],
  validDebtTypes: ['OWING', 'OWED'],
  examples: [
    {
      contact_name: "John Doe",
      contact_phone: "+237123456789",
      contact_email: "john@example.com",
      amount: 50000,
      currency: "XAF",
      description: "Prêt pour business",
      loan_date: "2024-01-15",
      due_date: "2024-02-15",
      repayment_date: "",
      status: "PENDING",
      debt_type: "OWING"
    },
    {
      contact_name: "Jane Smith",
      contact_phone: "+237987654321",
      contact_email: "",
      amount: 25000,
      currency: "XAF",
      description: "Prêt personnel",
      loan_date: "2024-01-10",
      due_date: "2024-01-25",
      repayment_date: "2024-01-24",
      status: "PAID",
      debt_type: "OWED"
    }
  ]
}

// Template pour l'import avec exemples
export const IMPORT_TEMPLATE: ExportData[] = [
  {
    contact_name: "John Doe",
    contact_phone: "+237123456789",
    contact_email: "john@example.com",
    amount: 50000,
    currency: "XAF",
    description: "Loan for business",
    loan_date: "2024-01-15",
    due_date: "2024-02-15",
    repayment_date: "",
    status: "PENDING",
    debt_type: "OWING"
  },
  {
    contact_name: "Jane Smith",
    contact_phone: "+237987654321",
    contact_email: "",
    amount: 25000,
    currency: "XAF",
    description: "Personal loan",
    loan_date: "2024-01-10",
    due_date: "2024-01-25",
    repayment_date: "2024-01-24",
    status: "PAID",
    debt_type: "OWED"
  }
]

// Convertir les données en CSV
export const convertToCSV = (data: ExportData[]): string => {
  if (!data || data.length === 0) return ''

  const headers = [
    'contact_name',
    'contact_phone', 
    'contact_email',
    'amount',
    'currency',
    'description',
    'loan_date',
    'due_date',
    'repayment_date',
    'status',
    'debt_type'
  ]

  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header as keyof ExportData] || ''
      // Échapper les guillemets et encapsuler les valeurs avec des virgules
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}

// Parser CSV en données
export const parseCSV = (csvContent: string): ExportData[] => {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données')

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const data: ExportData[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length !== headers.length) {
      console.warn(`Ligne ${i + 1} ignorée: nombre de colonnes incorrect`)
      continue
    }

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })

    // Validation et conversion des types
    try {
      const exportRow: ExportData = {
        contact_name: row.contact_name || '',
        contact_phone: row.contact_phone || '',
        contact_email: row.contact_email || '',
        amount: parseFloat(row.amount) || 0,
        currency: row.currency || 'XAF',
        description: row.description || '',
        loan_date: row.loan_date || '',
        due_date: row.due_date || '',
        repayment_date: row.repayment_date || '',
        status: (row.status as DebtStatus) || 'PENDING',
        debt_type: (row.debt_type as DebtType) || 'OWING'
      }

      // Validation des champs obligatoires
      if (!exportRow.contact_name || !exportRow.contact_phone || !exportRow.loan_date || !exportRow.due_date) {
        console.warn(`Ligne ${i + 1} ignorée: champs obligatoires manquants`)
        continue
      }

      // Validation des dates
      if (!isValidDate(exportRow.loan_date) || !isValidDate(exportRow.due_date)) {
        console.warn(`Ligne ${i + 1} ignorée: format de date invalide`)
        continue
      }

      // Validation du statut et du type
      if (!['PENDING', 'PAID', 'OVERDUE'].includes(exportRow.status)) {
        exportRow.status = 'PENDING'
      }

      if (!['OWING', 'OWED'].includes(exportRow.debt_type)) {
        exportRow.debt_type = 'OWING'
      }

      data.push(exportRow)
    } catch (error) {
      console.warn(`Erreur lors du parsing de la ligne ${i + 1}:`, error)
    }
  }

  return data
}

// Parser une ligne CSV en tenant compte des guillemets et virgules
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Guillemet échappé
        current += '"'
        i += 2
      } else {
        // Début ou fin de guillemets
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }
  
  result.push(current.trim())
  return result
}

// Validation de date
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// Exporter les dettes de l'utilisateur (génération du CSV)
export const generateExportData = async (userId: string): Promise<{ success: boolean; csvData?: string; error?: string }> => {
  try {
    // Récupérer toutes les dettes de l'utilisateur
    const debts = await getUserDebts(userId)
    
    if (debts.length === 0) {
      return { success: false, error: "Aucune dette à exporter" }
    }

    // Convertir en format d'export
    const exportData: ExportData[] = debts.map(debt => ({
      contact_name: debt.contact_name,
      contact_phone: debt.contact_phone,
      contact_email: debt.contact_email || '',
      amount: debt.amount,
      currency: debt.currency,
      description: debt.description || '',
      loan_date: debt.loan_date,
      due_date: debt.due_date,
      repayment_date: debt.repayment_date || '',
      status: debt.status,
      debt_type: debt.debt_type
    }))

    // Convertir en CSV
    const csvContent = convertToCSV(exportData)
    
    return { success: true, csvData: csvContent }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    return { success: false, error: 'Erreur lors de l\'export des données' }
  }
}

// Générer le template CSV avec exemples
export const generateTemplateData = (): string => {
  return convertToCSV(DATA_STRUCTURE_INFO.examples)
}

// Partager les données CSV 
export const shareExportData = async (csvData: string, filename?: string): Promise<void> => {
  try {
    const fileName = filename || `yourcap_export_${new Date().toISOString().split('T')[0]}.csv`
    
    if (Platform.OS === 'web') {
      // Pour le web, créer un lien de téléchargement
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Pour mobile, créer un fichier temporaire et le partager
      const file = new FileSystem.File(FileSystem.Paths.cache, fileName)
      
      // Écrire les données dans le fichier
      await file.write(csvData)
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exporter vos dettes YourCap'
        })
      } else {
        // Fallback vers Share API natif
        await Share.share({
          message: csvData,
          title: 'Export YourCap'
        })
      }
    }
  } catch (error) {
    console.error('Erreur lors du partage:', error)
    Alert.alert('Erreur', 'Impossible de partager les données')
  }
}

// Import depuis un fichier (avec sélecteur de fichiers)
export const importDebtsFromFile = async (userId: string): Promise<{ success: boolean; imported: number; errors: string[]; total: number }> => {
  try {
    if (Platform.OS === 'web') {
      return { success: false, imported: 0, errors: ['Sélection de fichier non supportée sur web. Utilisez l\'import par copier-coller.'], total: 0 }
    }

    // Ouvrir le sélecteur de fichiers
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      copyToCacheDirectory: true
    })

    if (result.canceled) {
      return { success: false, imported: 0, errors: ['Import annulé'], total: 0 }
    }

    // Lire le fichier
    const file = new FileSystem.File(result.assets[0].uri)
    const fileContent = await file.text()

    // Utiliser la fonction d'import existante
    return await importDebtsFromCSV(userId, fileContent)
  } catch (error) {
    console.error('Erreur lors de l\'import depuis fichier:', error)
    return {
      success: false,
      imported: 0,
      errors: ['Erreur lors de la lecture du fichier'],
      total: 0
    }
  }
}

// Importer des dettes depuis du contenu CSV
export const importDebtsFromCSV = async (userId: string, csvContent: string): Promise<{ success: boolean; imported: number; errors: string[]; total: number }> => {
  try {
    // Parser le CSV
    const importData = parseCSV(csvContent)
    
    if (importData.length === 0) {
      return { success: false, imported: 0, errors: ['Aucune donnée valide trouvée dans le contenu'], total: 0 }
    }

    // Importer chaque dette
    const errors: string[] = []
    let imported = 0

    for (let i = 0; i < importData.length; i++) {
      const data = importData[i]
      
      try {
        const debtInput: DebtInput = {
          user_id: userId,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email || undefined,
          amount: data.amount,
          currency: data.currency,
          description: data.description || undefined,
          loan_date: data.loan_date,
          due_date: data.due_date,
          repayment_date: data.repayment_date || undefined,
          status: data.status,
          debt_type: data.debt_type
        }

        await createDebt(debtInput)
        imported++
      } catch (error) {
        errors.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    return {
      success: imported > 0,
      imported,
      errors,
      total: importData.length
    }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    return {
      success: false,
      imported: 0,
      errors: ['Erreur lors du traitement des données'],
      total: 0
    }
  }
}

// Validation des données avant import
export const validateImportData = (data: ExportData[]): { valid: ExportData[]; invalid: { index: number; errors: string[] }[] } => {
  const valid: ExportData[] = []
  const invalid: { index: number; errors: string[] }[] = []

  data.forEach((item, index) => {
    const errors: string[] = []

    if (!item.contact_name?.trim()) errors.push('Nom du contact requis')
    if (!item.contact_phone?.trim()) errors.push('Téléphone du contact requis')
    if (!item.amount || item.amount <= 0) errors.push('Montant doit être supérieur à 0')
    if (!isValidDate(item.loan_date)) errors.push('Date de prêt invalide (format: YYYY-MM-DD)')
    if (!isValidDate(item.due_date)) errors.push('Date d\'échéance invalide (format: YYYY-MM-DD)')
    if (!['PENDING', 'PAID', 'OVERDUE'].includes(item.status)) errors.push('Statut invalide (PENDING, PAID, ou OVERDUE)')
    if (!['OWING', 'OWED'].includes(item.debt_type)) errors.push('Type de dette invalide (OWING ou OWED)')

    if (errors.length === 0) {
      valid.push(item)
    } else {
      invalid.push({ index: index + 1, errors })
    }
  })

  return { valid, invalid }
}