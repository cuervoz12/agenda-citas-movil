
import * as SQLite from "expo-sqlite";

export const database = SQLite.openDatabaseSync("agenda_citas.db");

export async function inicializarBaseDatos() {

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cita (
      id TEXT PRIMARY KEY NOT NULL,
      remote_id TEXT,
      servicio TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      updated_at TEXT,
      deleted INTEGER NOT NULL DEFAULT 0,
      pending INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS franja_cache (
      id TEXT PRIMARY KEY NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      disponible INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT
    );
  `);

  const tablas = await database.getAllAsync<{ name: string }>(
    `SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name IN ('cita', 'franja_cache')
    ORDER BY name;`
    );

    console.log("Tablas SQLite creadas:", tablas);
}
