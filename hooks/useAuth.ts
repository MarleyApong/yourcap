import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth"
import { createUser, loginUser } from "@/services/userService"
import { CreateUserInput } from "@/types/user"
import Toast from "react-native-toast-message"

type User = {
  user_id: string
  full_name: string
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
          user_id: result.user_id,
          full_name: result.full_name,
          email: result.email,
          phone_number: result.phone_number,
        }
        await setAuthToken(JSON.stringify(authUser))
        setUser(authUser)
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Login successful!",
        })
        return true
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid credentials",
        })
        return false
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Login failed. Please try again.",
      })
      return false
    }
  }

  const register = async (credentials: CreateUserInput & { confirmPassword: string }) => {
    const { confirmPassword, ...rest } = credentials
    if (rest.password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      })
      throw new Error("Passwords do not match")
    }

    try {
      // createUser devrait retourner le user_id créé
      const user_id = await createUser(rest)
      const authUser = {
        user_id: user_id,
        full_name: rest.full_name,
        email: rest.email,
        phone_number: rest.phone_number,
      }
      await setAuthToken(JSON.stringify(authUser))
      setUser(authUser)
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Registration successful!",
      })
      return true
    } catch (err) {
      console.error("Register error:", err)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Registration failed. Please try again.",
      })
      throw err
    }
  }
  
  const logout = async () => {
    await clearAuthToken()
    setUser(null)
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Logged out successfully",
    })
    router.replace("/")
  }

  return { user, loading, login, register, logout }
}
