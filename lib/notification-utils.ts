import { getUserDebts } from '../services/debtServices'

export interface NotificationSummaryContent {
  title: string
  body: string
}

export const generateLocalizedSummaryContent = async (
  userId: string,
  t: (key: any, params?: any) => string,
  frequency: 'daily' | 'weekly' = 'daily'
): Promise<NotificationSummaryContent> => {
  try {
    const debts = await getUserDebts(userId)
    const pendingDebts = debts.filter(debt => debt.status === "PENDING")
    
    const owingDebts = pendingDebts.filter(debt => debt.debt_type === "OWING")
    const owedDebts = pendingDebts.filter(debt => debt.debt_type === "OWED")
    
    const totalOwing = owingDebts.reduce((sum, debt) => sum + debt.amount, 0)
    const totalOwed = owedDebts.reduce((sum, debt) => sum + debt.amount, 0)
    
    // Use the appropriate title based on frequency
    const title = frequency === 'daily' 
      ? t('notifications.summary.dailySummary')
      : t('notifications.summary.weeklySummary')
    
    let body = ""
    
    if (owingDebts.length === 0 && owedDebts.length === 0) {
      body = t('notifications.summary.noPendingDebts')
    } else {
      const parts = []
      
      if (owingDebts.length > 0) {
        const owingKey = owingDebts.length === 1
          ? 'notifications.summary.owingFormatSingular'
          : 'notifications.summary.owingFormatPlural'
        parts.push(t(owingKey as any, {
          count: owingDebts.length,
          amount: totalOwing.toLocaleString(),
          currency: 'XAF'
        }))
      }

      if (owedDebts.length > 0) {
        const owedKey = owedDebts.length === 1
          ? 'notifications.summary.owedFormatSingular'
          : 'notifications.summary.owedFormatPlural'
        parts.push(t(owedKey as any, {
          count: owedDebts.length,
          amount: totalOwed.toLocaleString(),
          currency: 'XAF'
        }))
      }
      
      body = parts.join(" • ")
    }
    
    return { title, body }
  } catch (error) {
    console.error("Error generating localized summary content:", error)
    return {
      title: t('notifications.summary.debtSummaryTitle'),
      body: t('notifications.summary.summaryContent')
    }
  }
}

export const formatCurrency = (amount: number, currency: string = 'XAF'): string => {
  return `${amount.toLocaleString()} ${currency}`
}