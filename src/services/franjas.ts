
import { api } from "./api";

export interface Franja {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

interface FranjasResponse {
  ok: boolean;
  data: {
    fecha: string;
    duracionMinutos: number;
    franjas: Franja[];
  };
}

export async function obtenerFranjas(
  fecha: string,
  duracionMinutos: number
): Promise<Franja[]> {
  const respuesta = await api.get<FranjasResponse>("/franjas", {
    params: {
      fecha,
      duracionMinutos,
    },
  });

  if (!respuesta.data.ok) {
    throw new Error("No fue posible consultar los horarios.");
  }

  return respuesta.data.data.franjas;
}
