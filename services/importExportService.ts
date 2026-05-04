import { DebtInput, DebtStatus, DebtType, LateInterestType, InterestType } from '@/types/debt'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Platform, Share } from 'react-native'
import { createDebt, getUserDebts } from './debtServices'
import { addPayment, getPayments } from './paymentServices'
import Constants from 'expo-constants'

// ── Format JSON du backup ──────────────────────────────────────────

export interface BackupPayment {
  amount: number
  payment_date: string
  note?: string
}

export interface BackupDebt {
  contact_name: string
  contact_phone: string
  contact_email?: string
  amount: number
  currency: string
  description?: string
  loan_date: string
  due_date: string
  repayment_date?: string
  status: DebtStatus
  debt_type: DebtType
  interest_type: InterestType
  interest_rate: number
  late_interest_type: LateInterestType
  late_interest_rate: number
  payments: BackupPayment[]
}

export interface BackupFile {
  app: "yourcap"
  version: string
  exported_at: string
  debts: BackupDebt[]
}

// ── Export ─────────────────────────────────────────────────────────

export const generateBackup = async (userId: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  try {
    const debts = await getUserDebts(userId)
    if (debts.length === 0) return { success: false, error: "Aucune dette à exporter" }

    const backupDebts: BackupDebt[] = await Promise.all(debts.map(async debt => {
      const payments = await getPayments(debt.debt_id)
      return {
        contact_name: debt.contact_name,
        contact_phone: debt.contact_phone,
        contact_email: debt.contact_email,
        amount: debt.amount,
        currency: debt.currency,
        description: debt.description,
        loan_date: debt.loan_date,
        due_date: debt.due_date,
        repayment_date: debt.repayment_date,
        status: debt.status,
        debt_type: debt.debt_type,
        interest_type: debt.interest_type ?? "none",
        interest_rate: debt.interest_rate ?? 0,
        late_interest_type: debt.late_interest_type ?? "none",
        late_interest_rate: debt.late_interest_rate ?? 0,
        payments: payments.map(p => ({
          amount: p.amount,
          payment_date: p.payment_date,
          note: p.note,
        })),
      }
    }))

    const backup: BackupFile = {
      app: "yourcap",
      version: Constants.expoConfig?.version ?? "1.0.0",
      exported_at: new Date().toISOString(),
      debts: backupDebts,
    }

    return { success: true, data: JSON.stringify(backup, null, 2) }
  } catch (error) {
    console.error("Export error:", error)
    return { success: false, error: "Erreur lors de l'export" }
  }
}

export const shareBackup = async (jsonData: string): Promise<void> => {
  const fileName = `yourcap_backup_${new Date().toISOString().split("T")[0]}.json`

  if (Platform.OS === "web") {
    const blob = new Blob([jsonData], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    return
  }

  const file = new FileSystem.File(FileSystem.Paths.cache, fileName)
  await file.write(jsonData)

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Sauvegarder vos données YourCap",
    })
  } else {
    await Share.share({ message: jsonData, title: "Backup YourCap" })
  }
}

// ── Import ─────────────────────────────────────────────────────────

export const importBackupFromFile = async (userId: string): Promise<{ success: boolean; imported: number; total: number; errors: string[] }> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "*/*"],
      copyToCacheDirectory: true,
    })

    if (result.canceled) return { success: false, imported: 0, total: 0, errors: ["Import annulé"] }

    const file = new FileSystem.File(result.assets[0].uri)
    const content = await file.text()

    return await importBackupFromJSON(userId, content)
  } catch (error) {
    console.error("Import error:", error)
    return { success: false, imported: 0, total: 0, errors: ["Erreur de lecture du fichier"] }
  }
}

export const importBackupFromJSON = async (userId: string, jsonContent: string): Promise<{ success: boolean; imported: number; total: number; errors: string[] }> => {
  try {
    let backup: BackupFile
    try {
      backup = JSON.parse(jsonContent)
    } catch {
      return { success: false, imported: 0, total: 0, errors: ["Fichier JSON invalide"] }
    }

    if (backup.app !== "yourcap" || !Array.isArray(backup.debts)) {
      return { success: false, imported: 0, total: 0, errors: ["Format de fichier non reconnu — assurez-vous d'utiliser un backup YourCap"] }
    }

    const errors: string[] = []
    let imported = 0

    for (let i = 0; i < backup.debts.length; i++) {
      const d = backup.debts[i]
      try {
        const input: DebtInput = {
          user_id: userId,
          contact_name: d.contact_name,
          contact_phone: d.contact_phone,
          contact_email: d.contact_email,
          amount: d.amount,
          currency: d.currency ?? "XAF",
          description: d.description,
          loan_date: d.loan_date,
          due_date: d.due_date,
          repayment_date: d.repayment_date,
          status: d.status ?? "PENDING",
          debt_type: d.debt_type ?? "OWING",
          interest_type: d.interest_type ?? "none",
          interest_rate: d.interest_rate ?? 0,
          late_interest_type: d.late_interest_type ?? "none",
          late_interest_rate: d.late_interest_rate ?? 0,
        }
        const created = await createDebt(input)

        // Importer les paiements associés
        if (d.payments?.length) {
          for (const p of d.payments) {
            try {
              await addPayment({ debt_id: created.debt_id, amount: p.amount, payment_date: p.payment_date, note: p.note })
            } catch { /* paiement ignoré si dépasse le solde */ }
          }
        }

        imported++
      } catch (err) {
        errors.push(`Dette ${i + 1} (${d.contact_name ?? "?"}): ${err instanceof Error ? err.message : "erreur"}`)
      }
    }

    return { success: imported > 0, imported, total: backup.debts.length, errors }
  } catch (error) {
    return { success: false, imported: 0, total: 0, errors: ["Erreur lors du traitement"] }
  }
}
