import AsyncStorage from "@react-native-async-storage/async-storage"

const AUTH_TOKEN_KEY = "auth_token"

export const getAuthToken = async () => {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
}

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
}
