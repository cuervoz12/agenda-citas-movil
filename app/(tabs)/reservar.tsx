
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  obtenerFranjas,
  type Franja,
} from "../../src/services/franjas";

import { api } from "../../src/services/api";
import { programarRecordatorio } from "../../src/services/notificaciones";

type TipoCita = "general" | "especializada";

function fechaLocal(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function crearDias() {
  return Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + index);

    return {
      valor: fechaLocal(fecha),
      dia: fecha.toLocaleDateString("es-CO", {
        weekday: "short",
      }),
      numero: fecha.getDate(),
    };
  });
}

export default function ReservarScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    modo?: string;
    citaId?: string;
    fecha?: string;
    hora?: string;
    duracion?: string;
  }>();

  const dias = crearDias();

  const esReprogramacion = params.modo === "reprogramar";

  const duracionInicial = Number(params.duracion) === 60 ? 60 : 30;

  const [tipoCita, setTipoCita] = useState<TipoCita>(
    duracionInicial === 60 ? "especializada" : "general",
  );

  const [fecha, setFecha] = useState(
    params.fecha || dias[0].valor,
  );

  const [hora, setHora] = useState("");
  const [franjas, setFranjas] = useState<Franja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const duracionMinutos = tipoCita === "general" ? 30 : 60;

  useEffect(() => {
    let vigente = true;

    async function cargarFranjas() {
      try {
        setCargando(true);
        setError("");
        setHora("");
        setFranjas([]);

        const resultado = await obtenerFranjas(
          fecha,
          duracionMinutos,
        );

        if (vigente) {
          setFranjas(resultado);
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);

        if (vigente) {
          setError(
            "No fue posible consultar los horarios. Verifica tu conexión.",
          );
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    cargarFranjas();

    return () => {
      vigente = false;
    };
  }, [fecha, duracionMinutos]);

  async function continuar() {
    const franjaSeleccionada = franjas.find(
      (item) => item.horaInicio === hora && item.disponible,
    );

    if (!franjaSeleccionada) {
      Alert.alert(
        "Horario no disponible",
        "Selecciona una fecha y una hora disponible.",
      );
      return;
    }

    if (esReprogramacion) {
      if (!params.citaId) {
        Alert.alert(
          "Error",
          "No se encontró el identificador de la cita.",
        );
        return;
      }

      try {
        setGuardando(true);

        // Actualizar la cita en la API.
        await api.patch(`/citas/${params.citaId}`, {
          fecha,
          horaInicio: hora,
          duracionMinutos,
        });

        // Actualizar el recordatorio para la nueva fecha y hora.
        let mensaje =
          "Los cambios de tu cita se guardaron correctamente.";

        try {
          await programarRecordatorio(
            params.citaId,
            fecha,
            hora,
          );

          mensaje +=
            "\n\nTu recordatorio también fue actualizado para una hora antes de la cita.";
        } catch (error) {
          console.warn(
            "Error actualizando el recordatorio:",
            error,
          );

          mensaje +=
            "\n\nNo fue posible actualizar el recordatorio. Revisa los permisos de notificaciones de tu celular.";
        }

        Alert.alert(
          "Cita reprogramada",
          mensaje,
          [
            {
              text: "Aceptar",
              onPress: () => router.back(),
            },
          ],
        );
      } catch (error) {
        console.error("Error reprogramando cita:", error);

        const mensaje = (
          error as {
            response?: {
              data?: {
                error?: string;
              };
            };
          }
        )?.response?.data?.error;

        Alert.alert(
          "No fue posible reprogramar",
          mensaje || "Ocurrió un error al guardar los cambios.",
        );
      } finally {
        setGuardando(false);
      }

      return;
    }

    router.push({
      pathname: "/cita/[id]",
      params: {
        id: "vista-previa",
        tipoCita,
        duracion: String(duracionMinutos),
        fecha,
        hora,
      },
    });
  }

  return (
    <Screen>
      <Heading
        title={esReprogramacion ? "Reprogramar cita" : "Reservar cita"}
        subtitle={
          esReprogramacion
            ? "Selecciona una nueva fecha y horario para tu cita."
            : "Selecciona el tipo de cita, el día y el horario."
        }
      />

      <Card>
        <SectionTitle>1. Tipo de cita</SectionTitle>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: tipoCita === "general" }}
          onPress={() => setTipoCita("general")}
          style={[
            styles.option,
            tipoCita === "general" && styles.optionSelected,
          ]}
        >
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Consulta general</Text>
            <Text style={styles.muted}>Duración: 30 minutos</Text>
          </View>

          <Text style={styles.check}>
            {tipoCita === "general" ? "●" : "○"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            selected: tipoCita === "especializada",
          }}
          onPress={() => setTipoCita("especializada")}
          style={[
            styles.option,
            tipoCita === "especializada" && styles.optionSelected,
          ]}
        >
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>
              Consulta especializada
            </Text>
            <Text style={styles.muted}>Duración: 60 minutos</Text>
          </View>

          <Text style={styles.check}>
            {tipoCita === "especializada" ? "●" : "○"}
          </Text>
        </Pressable>
      </Card>

      <Card>
        <SectionTitle>2. Selecciona el día</SectionTitle>

        <View style={styles.days}>
          {dias.map((item) => (
            <Pressable
              key={item.valor}
              accessibilityRole="button"
              accessibilityState={{ selected: fecha === item.valor }}
              onPress={() => setFecha(item.valor)}
              style={[
                styles.day,
                fecha === item.valor && styles.daySelected,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  fecha === item.valor && styles.selectedText,
                ]}
              >
                {item.dia}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  fecha === item.valor && styles.selectedText,
                ]}
              >
                {item.numero}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>3. Horarios disponibles</SectionTitle>

        <Text style={styles.muted}>
          Atención de 09:00 a. m. a 06:00 p. m.
        </Text>

        {cargando ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text style={styles.muted}>
              Consultando disponibilidad...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>

            <Pressable
              onPress={() => setFecha((actual) => actual)}
              style={styles.retry}
            >
              <Text style={styles.retryText}>
                Vuelve a seleccionar el día
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.times}>
              {franjas.map((item) => {
                const seleccionada = hora === item.horaInicio;
                const deshabilitada = !item.disponible;

                return (
                  <Pressable
                    key={item.horaInicio}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: seleccionada,
                      disabled: deshabilitada,
                    }}
                    disabled={deshabilitada}
                    onPress={() => setHora(item.horaInicio)}
                    style={[
                      styles.time,
                      deshabilitada && styles.timeDisabled,
                      seleccionada && styles.timeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        deshabilitada && styles.timeTextDisabled,
                        seleccionada && styles.selectedText,
                      ]}
                    >
                      {item.horaInicio}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {franjas.length === 0 && (
              <Text style={styles.error}>
                No hay horarios disponibles para esta fecha.
              </Text>
            )}

            <View style={styles.legend}>
              <Text style={styles.legendText}>
                ● Disponible
              </Text>
              <Text style={styles.legendDisabled}>
                ● Ocupado
              </Text>
            </View>
          </>
        )}
      </Card>

      <PrimaryButton
        title={
          guardando
            ? "Guardando cambios..."
            : esReprogramacion
              ? "Guardar nueva fecha"
              : "Continuar"
        }
        onPress={continuar}
        disabled={cargando || !!error || !hora || guardando}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    gap: 4,
  },
  optionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  muted: {
    color: colors.muted,
    fontSize: 12,
  },
  check: {
    color: colors.primary,
    fontSize: 20,
  },
  center: {
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  error: {
    color: "#DC2626",
    textAlign: "center",
    marginTop: 12,
  },
  retry: {
    padding: 10,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  days: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },
  day: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 10,
    color: colors.muted,
    textTransform: "capitalize",
  },
  dayNumber: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "800",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  times: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 15,
  },
  time: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeDisabled: {
    backgroundColor: "#EEEEEE",
    borderColor: "#E0E0E0",
  },
  timeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  timeTextDisabled: {
    color: "#999999",
    textDecorationLine: "line-through",
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    marginTop: 18,
  },
  legendText: {
    color: colors.primary,
    fontSize: 11,
  },
  legendDisabled: {
    color: colors.muted,
    fontSize: 11,
  },
});
