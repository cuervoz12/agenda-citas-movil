
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Screen,
  Card,
  Heading,
  PrimaryButton,
  Tag,
  colors,
} from "../../src/components/ui";
import { api } from "../../src/services/api";
import { programarRecordatorio } from "../../src/services/notificaciones";

function generarUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (caracter) => {
      const aleatorio = Math.floor(Math.random() * 16);
      const valor =
        caracter === "x" ? aleatorio : (aleatorio & 0x3) | 0x8;

      return valor.toString(16);
    },
  );
}

export default function DetalleCitaScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id: string;
    tipoCita?: string;
    duracion?: string;
    fecha?: string;
    hora?: string;
  }>();

  const [cargando, setCargando] = useState(false);
  const [confirmada, setConfirmada] = useState(false);
  const [idCita] = useState(generarUUID);

  const tipoCita =
    params.tipoCita === "especializada"
      ? "Consulta especializada"
      : "Consulta general";

  const fecha = params.fecha || "";
  const hora = params.hora || "";
  const duracion = Number(params.duracion || 30);

  async function confirmarReserva() {
    if (!fecha || !hora || ![30, 60].includes(duracion)) {
      Alert.alert(
        "Datos incompletos",
        "Regresa y selecciona nuevamente el día y el horario.",
      );
      return;
    }

    try {
      setCargando(true);

      // Crear la cita en la API.
      const respuesta = await api.post("/auth/citas", {
        id: idCita,
        fecha,
        horaInicio: hora,
        duracionMinutos: duracion,
      });

      if (!respuesta.data?.ok) {
        throw new Error(
          respuesta.data?.error || "No fue posible confirmar la cita.",
        );
      }

      // La cita ya está guardada. Programar el recordatorio.
      let mensaje = "Tu cita se guardó correctamente.";

      try {
        await programarRecordatorio(idCita, fecha, hora);

        mensaje +=
          "\n\nTambién programamos un recordatorio para una hora antes de tu cita.";
      } catch (error) {
        console.warn("Error programando recordatorio:", error);

        mensaje +=
          "\n\nNo pudimos activar el recordatorio. Revisa los permisos de notificaciones de tu celular.";
      }

      setConfirmada(true);

      Alert.alert("¡Reserva confirmada!", mensaje);
    } catch (error) {
      console.error("Error confirmando reserva:", error);

      const mensaje =
        (
          error as {
            response?: {
              data?: { error?: string };
            };
          }
        )?.response?.data?.error ||
        (error instanceof Error ? error.message : "") ||
        "No fue posible guardar la reserva. Inténtalo nuevamente.";

      Alert.alert("No se pudo reservar", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Screen>
      <Heading
        title="Detalle de la cita"
        subtitle="Revisa los datos antes de confirmar tu reserva."
      />

      <Card>
        <Tag variant={confirmada ? "success" : "warning"}>
          {confirmada ? "Reserva confirmada" : "Pendiente de confirmación"}
        </Tag>

        <Text style={styles.service}>{tipoCita}</Text>

        <View style={styles.info}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{fecha}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Hora de inicio</Text>
          <Text style={styles.value}>{hora}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Duración</Text>
          <Text style={styles.value}>{duracion} minutos</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>
            {confirmada ? "Pendiente" : "Sin confirmar"}
          </Text>
        </View>

        {confirmada && (
          <View style={styles.success}>
            <Text style={styles.successText}>
              Tu reserva quedó registrada correctamente.
            </Text>

            <Text style={styles.idText}>
              Código: {idCita}
            </Text>
          </View>
        )}
      </Card>

      {!confirmada ? (
        <>
          <PrimaryButton
            title={cargando ? "Guardando reserva..." : "Confirmar reserva"}
            onPress={confirmarReserva}
            disabled={cargando}
          />

          {cargando && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loader}
            />
          )}

          <View style={styles.secondary}>
            <PrimaryButton
              title="Elegir otro horario"
              onPress={() => router.replace("/(tabs)/reservar")}
              disabled={cargando}
            />
          </View>
        </>
      ) : (
        <PrimaryButton
          title="Volver al inicio"
          onPress={() => router.replace("/(tabs)")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  service: {
    fontSize: 22,
    color: colors.text,
    fontWeight: "800",
    marginVertical: 12,
  },
  info: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    gap: 5,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "700",
  },
  secondary: {
    opacity: 0.85,
    marginTop: 10,
  },
  loader: {
    marginTop: 12,
  },
  success: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    gap: 6,
  },
  successText: {
    color: "#166534",
    fontWeight: "700",
  },
  idText: {
    color: "#166534",
    fontSize: 11,
  },
});
