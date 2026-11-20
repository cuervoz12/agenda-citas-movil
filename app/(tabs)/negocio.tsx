
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Alert } from "react-native";
import {
  Screen,
  Card,
  Heading,
  PrimaryButton,
  SectionTitle,
  colors,
} from "../../src/components/ui";

export default function NegocioScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Heading
        title="Nuestro negocio"
        subtitle="Conoce el establecimiento y prepara tu visita."
      />

      <Card>
        <View style={styles.cover}>
          <Text style={styles.coverIcon}>📍</Text>
        </View>

        <SectionTitle>Establecimiento</SectionTitle>
        <Text style={styles.description}>
          Aquí encontrarás la información del negocio donde tienes programada
          tu cita.
        </Text>

        <View style={styles.info}>
          <Text style={styles.label}>Dirección</Text>
          <Text style={styles.value}>Dirección pendiente de configurar</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Horario de atención</Text>
          <Text style={styles.value}>Lunes a sábado · 09:00 a. m. – 06:00 p. m.</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Duración de las franjas</Text>
          <Text style={styles.value}>30 minutos</Text>
        </View>
      </Card>

      <Card>
        <SectionTitle>¿Cómo llegar?</SectionTitle>
        <Text style={styles.description}>
          Cuando configuremos la ubicación del establecimiento podrás consultar
          la distancia y obtener indicaciones para llegar.
        </Text>

        <PrimaryButton
          title="Consultar cómo llegar"
          onPress={() =>
            Alert.alert(
              "Ubicación pendiente",
              "La ubicación y los sensores se configurarán en la siguiente etapa."
            )
          }
        />
      </Card>

      <PrimaryButton
        title="Volver al inicio"
        onPress={() => router.replace("/(tabs)")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 145,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  coverIcon: {
    fontSize: 52,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  info: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 5,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
