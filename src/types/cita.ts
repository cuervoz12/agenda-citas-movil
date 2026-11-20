
export interface Cita {
  id: string;
  remote_id: string | null;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  updated_at: string | null;
  deleted: number;
  pending: number;
}

export interface NuevaCita {
  id: string;
  servicio: string;
  fecha: string;
  hora: string;
}
