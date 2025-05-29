import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth"
import { createUser, loginUser } from "@/services/userService"
import { CreateUserInput } from "@/types/user"

type User = {
  token: string
  firstname: string
  lastname: string
  email: string
  phone_number: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken()
      if (token) {
        // Ici on pourrait décoder un JWT ou retrouver l'utilisateur via SQLite si besoin
        setUser(JSON.parse(token))
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      const result = await loginUser(credentials.identifier, credentials.password)
      if (result) {
        const authUser = {
          token: JSON.stringify(result), // simulé ici comme un token
          firstname: result.firstname,
          lastname: result.lastname,
          email: result.email,
          phone_number: result.phone_number,
        }
        await setAuthToken(authUser.token)
        setUser(authUser)
        return true
      } else {
        return false
      }
    } catch (err) {
      console.error("Login error:", err)
      return false
    }
  }

  const register = async (credentials: CreateUserInput & { confirmPassword: string }) => {
    const { confirmPassword, ...rest } = credentials
    if (rest.password !== confirmPassword) {
      throw new Error("Passwords do not match")
    }

    try {
      await createUser(rest)
      const fakeToken = JSON.stringify(rest)
      await setAuthToken(fakeToken)
      setUser({
        token: fakeToken,
        firstname: rest.firstname,
        lastname: rest.lastname,
        email: rest.email,
        phone_number: rest.phone_number,
      })
      return true
    } catch (err) {
      console.error("Register error:", err)
      throw err
    }
  }

  const logout = async () => {
    await clearAuthToken()
    setUser(null)
    router.replace("/")
  }

  return { user, loading, login, register, logout }
}
