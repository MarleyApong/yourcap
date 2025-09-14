import * as SQLite from "expo-sqlite";
export const expoDb = SQLite.openDatabaseSync("debt_app.db");