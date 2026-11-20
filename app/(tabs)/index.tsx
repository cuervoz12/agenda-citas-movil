
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  Screen,
  Card,
  Heading,
  PrimaryButton,
  SectionTitle,
  colors,
} from "../../src/components/ui";

import {
  obtenerUsuario,
  cerrarSesion,
} from "../../src/services/auth";

import { api } from "../../src/services/api";
import { cancelarRecordatorio } from "../../src/services/notificaciones";

interface Usuario {
  uid?: string;
  nombre?: string;
  correo?: string;
}

interface Cita {
  id: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
  estado: "pendiente" | "cancelada" | "completada";
}

interface CitasResponse {
  ok: boolean;
  data: Cita[];
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaLocal = new Date(anio, mes - 1, dia, 12);

  return fechaLocal.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function obtenerTipoCita(duracion: number) {
  return duracion === 60
    ? "Consulta especializada"
    : "Consulta general";
}

function textoEstado(estado: Cita["estado"]) {
  switch (estado) {
    case "pendiente":
      return "Reservada";
    case "cancelada":
      return "Cancelada";
    case "completada":
      return "Completada";
    default:
      return estado;
  }
}

export default function InicioScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [errorCitas, setErrorCitas] = useState("");
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const datos = await obtenerUsuario();
        setUsuario(datos);
      } catch {
        Alert.alert(
          "Sesión no disponible",
          "No pudimos obtener tus datos. Inicia sesión nuevamente.",
          [
            {
              text: "Continuar",
              onPress: async () => {
                await cerrarSesion();
                router.replace("/login");
              },
            },
          ],
        );
      } finally {
        setCargando(false);
      }
    }

    cargarUsuario();
  }, []);

  const cargarCitas = useCallback(async () => {
    try {
      setCargandoCitas(true);
      setErrorCitas("");

      const respuesta = await api.get<CitasResponse>("/auth/citas");

      if (!respuesta.data.ok || !Array.isArray(respuesta.data.data)) {
        throw new Error("La respuesta de las citas no es válida.");
      }

      const resultado = [...respuesta.data.data];

      resultado.sort((a, b) => {
        const fechaA = `${a.fecha} ${a.horaInicio}`;
        const fechaB = `${b.fecha} ${b.horaInicio}`;
        return fechaA.localeCompare(fechaB);
      });

      setCitas(resultado);
    } catch (error) {
      console.error("Error cargando citas:", error);
      setErrorCitas(
        "No fue posible cargar tus reservas. Comprueba tu conexión.",
      );
    } finally {
      setCargandoCitas(false);
    }
  }, []);

  async function handleCancelarCita(cita: Cita) {
    Alert.alert(
      "Cancelar cita",
      `¿Estás seguro de que deseas cancelar tu cita del ${formatearFecha(
        cita.fecha,
      )} a las ${cita.horaInicio}?`,
      [
        {
          text: "No, conservar",
          style: "cancel",
        },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelandoId(cita.id);

              // Primero cancelar la cita en el servidor.
              const respuesta = await api.delete(`/citas/${cita.id}`);

              if (!respuesta.data.ok) {
                throw new Error(
                  respuesta.data.error || "No fue posible cancelar la cita.",
                );
              }

              // Después eliminar el recordatorio local del teléfono.
              try {
                await cancelarRecordatorio(cita.id);
              } catch (error) {
                console.warn(
                  "No se pudo eliminar el recordatorio:",
                  error,
                );
              }

              Alert.alert(
                "Cita cancelada",
                "Tu reserva fue cancelada correctamente. El horario vuelve a estar disponible.",
              );

              await cargarCitas();
            } catch (error: any) {
              console.error("Error cancelando cita:", error);

              const mensaje =
                error?.response?.data?.error ||
                error?.message ||
                "No fue posible cancelar la cita. Inténtalo nuevamente.";

              Alert.alert("No se pudo cancelar", mensaje);
            } finally {
              setCancelandoId(null);
            }
          },
        },
      ],
    );
  }

  function handleReprogramarCita(cita: Cita) {
    router.push({
      pathname: "/(tabs)/reservar",
      params: {
        modo: "reprogramar",
        citaId: cita.id,
        fecha: cita.fecha,
        hora: cita.horaInicio,
        duracion: String(cita.duracionMinutos),
      },
    });
  }

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [cargarCitas]),
  );

  async function handleCerrarSesion() {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setCerrandoSesion(true);
              await cerrarSesion();
              router.replace("/login");
            } catch {
              Alert.alert("Error", "No fue posible cerrar la sesión.");
            } finally {
              setCerrandoSesion(false);
            }
          },
        },
      ],
    );
  }

  const nombre = usuario?.nombre || "Usuario";
  const inicial = nombre.charAt(0).toUpperCase();

  const citasActivas = citas.filter(
    (cita) => cita.estado === "pendiente",
  );

  const citasCanceladas = citas.filter(
    (cita) => cita.estado === "cancelada",
  );

  const citasCompletadas = citas.filter(
    (cita) => cita.estado === "completada",
  );

  if (cargando) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.detail}>Cargando tu perfil...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>BIENVENIDO</Text>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.email}>{usuario?.correo || ""}</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleCerrarSesion}
        disabled={cerrandoSesion}
      >
        {cerrandoSesion ? (
          <ActivityIndicator color="#DC2626" />
        ) : (
          <Text style={styles.logoutText}>Cerrar sesión ↗</Text>
        )}
      </Pressable>

      <Heading
        title="Tu agenda"
        subtitle="Aquí puedes consultar tus reservas."
      />

      <View style={styles.stats}>
        <Card>
          <Text style={styles.statNumber}>{citasActivas.length}</Text>
          <Text style={styles.statLabel}>Reservadas</Text>
        </Card>

        <Card>
          <Text style={styles.statNumber}>{citasCompletadas.length}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </Card>

        <Card>
          <Text style={styles.statNumber}>{citasCanceladas.length}</Text>
          <Text style={styles.statLabel}>Canceladas</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <SectionTitle>Mis citas</SectionTitle>

        <Pressable onPress={cargarCitas}>
          <Text style={styles.refreshText}>Actualizar ↻</Text>
        </Pressable>
      </View>

      {cargandoCitas ? (
        <Card>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.detail}>Cargando tus reservas...</Text>
          </View>
        </Card>
      ) : errorCitas ? (
        <Card>
          <Text style={styles.error}>{errorCitas}</Text>
          <PrimaryButton
            title="Volver a intentar"
            onPress={cargarCitas}
          />
        </Card>
      ) : citas.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Todavía no tienes citas</Text>
          <Text style={styles.detail}>
            Cuando confirmes una reserva, aparecerá aquí.
          </Text>
        </Card>
      ) : (
        citas.map((cita) => (
          <Card key={cita.id}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.service}>
                {obtenerTipoCita(cita.duracionMinutos)}
              </Text>

              <View
                style={[
                  styles.status,
                  cita.estado === "pendiente" && styles.statusPending,
                  cita.estado === "cancelada" && styles.statusCancelled,
                  cita.estado === "completada" && styles.statusCompleted,
                ]}
              >
                <Text style={styles.statusText}>
                  {textoEstado(cita.estado)}
                </Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>
                {formatearFecha(cita.fecha)}
              </Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Hora</Text>
              <Text style={styles.value}>{cita.horaInicio}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.label}>Duración</Text>
              <Text style={styles.value}>
                {cita.duracionMinutos} minutos
              </Text>
            </View>

            <Text style={styles.idText}>Código: {cita.id}</Text>

            {cita.estado === "pendiente" && (
              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.rescheduleButton,
                    cancelandoId !== null && styles.buttonDisabled,
                  ]}
                  onPress={() => handleReprogramarCita(cita)}
                  disabled={cancelandoId !== null}
                >
                  <Text style={styles.rescheduleButtonText}>
                    Reprogramar cita
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.cancelButton,
                    cancelandoId !== null && styles.buttonDisabled,
                  ]}
                  onPress={() => handleCancelarCita(cita)}
                  disabled={cancelandoId !== null}
                >
                  {cancelandoId === cita.id ? (
                    <ActivityIndicator color="#DC2626" />
                  ) : (
                    <Text style={styles.cancelButtonText}>
                      Cancelar cita
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </Card>
        ))
      )}

      <PrimaryButton
        title="Reservar una cita"
        onPress={() => router.push("/(tabs)/reservar")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 3,
  },
  email: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 19,
  },
  logoutButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },
  stats: {
    flexDirection: "row",
    gap: 8,
  },
  statNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  service: {
    fontSize: 17,
    color: colors.text,
    fontWeight: "800",
    flex: 1,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusCancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusCompleted: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  info: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
  },
  idText: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 12,
  },
  actions: {
    gap: 9,
    marginTop: 14,
  },
  rescheduleButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
  },
  rescheduleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
