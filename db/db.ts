import { openDatabaseSync } from "expo-sqlite"
const db = openDatabaseSync("debt_app.db")

export const initDb = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY NOT NULL,
        firstname TEXT,
        lastname TEXT,
        email TEXT UNIQUE,
        phone_number TEXT UNIQUE,
        password TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
      );
    `)

    console.log("✅ DB initialized")
  } catch (error) {
    console.error("❌ Erreur init DB:", error)
  }
}

export default db
