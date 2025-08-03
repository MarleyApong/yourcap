import { openDatabaseSync } from "expo-sqlite"
const db = openDatabaseSync("debt_app.db")

export const initDb = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY NOT NULL,
        full_name TEXT,
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
    throw error // On propage l'erreur pour la gérer plus haut
  }
}

// Fonction pour reset complètement la base de données
export const resetDatabase = async () => {
  try {
    // Supprime toutes les tables
    await db.execAsync(`
      DROP TABLE IF EXISTS users;
    `)

    console.log("🗑️ Database tables dropped")

    // Réinitialise la base avec les tables vides
    await initDb()

    console.log("🔄 Database reinitialized")
    return true
  } catch (error) {
    console.error("❌ Error resetting database:", error)
    throw error
  }
}

// resetDatabase()

export default db
