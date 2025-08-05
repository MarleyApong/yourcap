import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface AppContextType {
  refreshTrigger: number
  triggerRefresh: () => void
  currency: string
  setCurrency: (currency: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currency, setCurrency] = useState("USD")

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const updateCurrency = useCallback((newCurrency: string) => {
    setCurrency(newCurrency)
    triggerRefresh() // Déclenche aussi un rafraîchissement global
  }, [])

  return (
    <AppContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        currency,
        setCurrency: updateCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppRefresh = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppRefresh must be used within AppProvider")
  }
  return context
}

export const useAppCurrency = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppCurrency must be used within AppProvider")
  }
  return {
    currency: context.currency,
    setCurrency: context.setCurrency,
  }
}
