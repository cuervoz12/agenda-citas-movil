import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { registrarUsuario } from "../src/services/auth";

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleRegistro() {
    if (!nombre.trim() || !correo.trim() || !contrasena || !confirmar) {
      Alert.alert("Campos incompletos", "Completa todos los campos.");
      return;
    }

    if (contrasena.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (contrasena !== confirmar) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      await registrarUsuario({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena,
      });

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        [
          {
            text: "Continuar",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No fue posible crear la cuenta.";

      Alert.alert("Error de registro", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.encabezado}>
        <Text style={styles.icono}>👤</Text>
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>
          Regístrate para comenzar a agendar tus citas.
        </Text>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.etiqueta}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.etiqueta}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        <Text style={styles.etiqueta}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Repite tu contraseña"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry
        />

        <Pressable
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBoton}>Crear cuenta</Text>
          )}
        </Pressable>

        <View style={styles.pie}>
          <Text style={styles.textoPie}>¿Ya tienes una cuenta?</Text>
          <Link href="/login" style={styles.enlace}>
            Inicia sesión
          </Link>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 30,
  },
  icono: {
    fontSize: 50,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
  },
  subtitulo: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  formulario: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    elevation: 3,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    color: "#0F172A",
  },
  boton: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  pie: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
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