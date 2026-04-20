import * as Crypto from "expo-crypto"
import bcrypt from "bcryptjs"

const PREFIX = "sha256v1"

export const hashPin = async (pin: string): Promise<string> => {
  const salt = Crypto.randomUUID().replace(/-/g, "")
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin + salt)
  return `${PREFIX}:${salt}:${hash}`
}

export const verifyPin = async (pin: string, stored: string): Promise<boolean> => {
  if (stored.startsWith(`${PREFIX}:`)) {
    const parts = stored.split(":")
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    const computed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin + salt)
    return computed === hash
  }
  // Legacy bcrypt hash — used only during migration
  return bcrypt.compare(pin, stored)
}

export const isBcryptHash = (stored: string): boolean =>
  stored.startsWith("$2b$") || stored.startsWith("$2a$") || stored.startsWith("$2y$")
