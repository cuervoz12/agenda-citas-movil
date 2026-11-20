
import { database } from "./database";
import { Cita, NuevaCita } from "../types/cita";

export async function guardarCitaLocal(
  cita: NuevaCita
): Promise<void> {
  await database.runAsync(
    `INSERT INTO cita (
      id,
      servicio,
      fecha,
      hora,
      estado,
      deleted,
      pending
    ) VALUES (?, ?, ?, ?, ?, 0, 1)`,
    cita.id,
    cita.servicio,
    cita.fecha,
    cita.hora,
    "pendiente"
  );
}

export async function listarCitasLocales(): Promise<Cita[]> {
  return database.getAllAsync<Cita>(
    `SELECT *
     FROM cita
     WHERE deleted = 0
     ORDER BY fecha ASC, hora ASC`
  );
}

export async function obtenerCitaLocal(
  id: string
): Promise<Cita | null> {
  return database.getFirstAsync<Cita>(
    `SELECT *
     FROM cita
     WHERE id = ?`,
    id
  );
}
