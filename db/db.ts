import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite"

let db: SQLiteDatabase | null = null

export const getDb = (): SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.")
  }
  return db
}

export const initDb = async (): Promise<void> => {
  try {
    if (!db) {
      db = openDatabaseSync("debt_app.db")
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY NOT NULL,
        full_name TEXT,
        email TEXT UNIQUE,
        phone_number TEXT UNIQUE,
        pin TEXT,
        biometric_enabled INTEGER DEFAULT 0,
        status TEXT,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS debts (
        debt_id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        description TEXT,
        loan_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        repayment_date TEXT,
        status TEXT NOT NULL,
        debt_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT PRIMARY KEY NOT NULL,
        notification_enabled INTEGER DEFAULT 1,
        days_before_reminder INTEGER DEFAULT 3,
        language TEXT DEFAULT 'en',
        currency TEXT DEFAULT 'USD',
        inactivity_timeout INTEGER DEFAULT 30,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        notification_id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        debt_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (debt_id) REFERENCES debts(debt_id)
      );

      CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
      CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
      CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
    `)

    console.log("✅ Database initialized successfully")
  } catch (error) {
    console.error("❌ Database initialization error:", error)
    throw error
  }
}

export const resetDatabase = async (): Promise<boolean> => {
  try {
    if (!db) {
      await initDb()
    }

    const database = getDb()

    await database.execAsync(`
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS debts;
      DROP TABLE IF EXISTS users;
    `)

    console.log("🗑️ Database tables dropped")

    db = null
    await initDb()

    console.log("🔄 Database reset successfully")
    return true
  } catch (error) {
    console.error("❌ Error resetting database:", error)
    throw error
  }
}

// resetDatabase()

export const isDatabaseReady = (): boolean => {
  return db !== null
}

export default {
  get instance() {
    return getDb()
  },
}
