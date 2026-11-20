
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio" }}
      />
      <Tabs.Screen
        name="reservar"
        options={{ title: "Reservar" }}
      />
      <Tabs.Screen
        name="negocio"
        options={{
          title: "Negocio",
          href: null,
        }}
      />
    </Tabs>
  );
}
