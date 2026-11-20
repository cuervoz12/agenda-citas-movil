
import { api } from "./api";

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precio: number;
}

interface ServiciosResponse {
  ok: boolean;
  data: Servicio[];
}

export async function obtenerServicios(): Promise<Servicio[]> {
  const respuesta = await api.get<ServiciosResponse>("/servicios");

  if (!respuesta.data.ok) {
    throw new Error("No fue posible cargar los servicios.");
  }

  return respuesta.data.data;
}
