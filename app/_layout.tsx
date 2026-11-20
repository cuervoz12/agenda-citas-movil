
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { inicializarBaseDatos } from "../src/database/database";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    inicializarBaseDatos()
      .then(() => {
        setReady(true);
        console.log("Base de datos SQLite inicializada correctamente");
      })
      .catch((err) => {
        console.error("Error al inicializar SQLite:", err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          No se pudo iniciar la base de datos local.
          Revisa los registros de Expo.
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6258E8" />
        <Text style={styles.text}>Preparando Agenda de Citas...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="cita" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 24,
    gap: 12,
  },
  text: {
    color: "#202139",
    fontSize: 15,
  },
  error: {
    color: "#B42318",
    fontSize: 15,
    textAlign: "center",
  },
});
