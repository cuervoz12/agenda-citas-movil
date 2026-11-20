import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { iniciarSesion } from "../src/services/auth";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    if (!correo.trim() || !contrasena) {
      Alert.alert("Campos incompletos", "Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);

      await iniciarSesion({
        correo: correo.trim().toLowerCase(),
        contrasena,
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No fue posible iniciar sesión.";

      Alert.alert("Error de inicio de sesión", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Agenda de Citas</Text>
          <Text style={styles.subtitulo}>
            Organiza tus citas de manera sencilla.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.tituloFormulario}>Iniciar sesión</Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
          />

          <Pressable
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBoton}>Ingresar</Text>
            )}
          </Pressable>

          <View style={styles.pie}>
            <Text style={styles.textoPie}>¿No tienes una cuenta?</Text>
            <Link href="/registro" style={styles.enlace}>
              Regístrate
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  encabezado: {
    alignItems: "center",
    marginBottom: 35,
  },
  icono: {
    fontSize: 55,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },
  formulario: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    elevation: 3,
  },
  tituloFormulario: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 25,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: "#0F172A",
  },
  boton: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  pie: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },
  textoPie: {
    color: "#64748B",
  },
  enlace: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});