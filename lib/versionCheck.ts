import AsyncStorage from "@react-native-async-storage/async-storage"

const LAST_SEEN_VERSION_KEY = "last_seen_app_version"
const TERMS_ACCEPTED_VERSION_KEY = "terms_accepted_version"

export const getLastSeenVersion = async (): Promise<string | null> => {
  return AsyncStorage.getItem(LAST_SEEN_VERSION_KEY)
}

export const setLastSeenVersion = async (version: string): Promise<void> => {
  await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, version)
}

export const getAcceptedTermsVersion = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TERMS_ACCEPTED_VERSION_KEY)
}

export const setAcceptedTermsVersion = async (version: string): Promise<void> => {
  await AsyncStorage.setItem(TERMS_ACCEPTED_VERSION_KEY, version)
}
