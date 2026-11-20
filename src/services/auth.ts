import { api } from "./api";
import * as SecureStore from "expo-secure-store";

interface RegistroInput {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface LoginInput {
  correo: string;
  contrasena: string;
}

interface AuthResponse {
  uid: string;
  correo: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

export async function registrarUsuario(datos: RegistroInput) {
  const respuesta = await api.post("/auth/registro", datos);

  return respuesta.data;
}

export async function iniciarSesion(
  datos: LoginInput
): Promise<AuthResponse> {
  const respuesta = await api.post("/auth/login", datos);

  const usuario = respuesta.data.data;

  await SecureStore.setItemAsync("token", usuario.idToken);
  await SecureStore.setItemAsync("refreshToken", usuario.refreshToken);

  return usuario;
}

export async function cerrarSesion() {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("refreshToken");
}

export async function obtenerUsuario() {
  const respuesta = await api.get("/auth/me");

  return respuesta.data.data;
}