
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const obtenerClave = (citaId: string) => `recordatorio_cita_${citaId}`;

export async function configurarNotificaciones(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("recordatorios", {
      name: "Recordatorios de citas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }

  const permisos = await Notifications.getPermissionsAsync();
  let concedido = permisos.granted;

  if (!concedido) {
    const solicitud = await Notifications.requestPermissionsAsync();
    concedido = solicitud.granted;
  }

  return concedido;
}

export async function programarRecordatorio(
  citaId: string,
  fecha: string,
  horaInicio: string,
): Promise<void> {
  await cancelarRecordatorio(citaId);

  const permiso = await configurarNotificaciones();

  if (!permiso) {
    throw new Error("No se concedieron permisos para las notificaciones.");
  }

  const fechaCita = new Date(`${fecha}T${horaInicio}:00`);
  const fechaRecordatorio = new Date(
    fechaCita.getTime() - 60 * 60 * 1000,
  );

  // No programar recordatorios cuya hora ya pasó.
  if (fechaRecordatorio.getTime() <= Date.now()) {
    return;
  }

  const identificador = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de tu cita",
      body: `Tu cita comienza en una hora, a las ${horaInicio}. ¡No olvides asistir!`,
      sound: "default",
      data: { citaId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fechaRecordatorio,
      channelId: "recordatorios",
    },
  });

  await SecureStore.setItemAsync(
    obtenerClave(citaId),
    identificador,
  );
}

export async function cancelarRecordatorio(
  citaId: string,
): Promise<void> {
  const clave = obtenerClave(citaId);
  const identificador = await SecureStore.getItemAsync(clave);

  if (identificador) {
    await Notifications.cancelScheduledNotificationAsync(identificador);
    await SecureStore.deleteItemAsync(clave);
  }
}
