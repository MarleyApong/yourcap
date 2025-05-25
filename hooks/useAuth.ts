import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { getAuthToken, clearAuthToken, setAuthToken } from "@/lib/auth"

type User = {
  token: string
  name?: string
  email?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken()
      if (token) {
        setUser({ token, name: "John Doe", email: "john@example.com" })
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    // Simulation de connexion
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const fakeToken = "fake-token-123"
    await setAuthToken(fakeToken)
    setUser({
      token: fakeToken,
      name: "John Doe",
      email: credentials.email,
    })
    return true
  }

  const register = async (credentials: { name: string; email: string; password: string }) => {
    // Simulation d'inscription
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const fakeToken = "fake-token-123"
    await setAuthToken(fakeToken)
    setUser({
      token: fakeToken,
      name: credentials.name,
      email: credentials.email,
    })
    return true
  }

  const logout = async () => {
    await clearAuthToken()
    setUser(null)
    router.replace("/")
  }

  return { user, loading, login, register, logout }
}
