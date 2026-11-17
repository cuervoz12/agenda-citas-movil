
# AGENTS.md — Agenda de Citas Móvil

## 1. Identidad del proyecto

Proyecto: Agenda de Citas Móvil.
Repositorio: agenda-citas-movil.

Aplicación móvil desarrollada con:
- Expo
- React Native
- TypeScript
- Expo Router
- SQLite

La aplicación consume exclusivamente la API REST del proyecto
agenda-citas-api.

## 2. Reglas obligatorias

- Respetar la arquitectura definida en el proyecto.
- Utilizar TypeScript.
- Mantener separadas las pantallas, componentes, servicios,
  repositorios y lógica de negocio.
- Utilizar consultas SQL parametrizadas.
- Validar los datos antes de procesarlos.
- Escribir pruebas para la lógica de negocio.
- No duplicar lógica que corresponde a la API.
- No introducir funcionalidades adicionales sin autorización.
- Documentar los cambios importantes.

## 3. Seguridad y credenciales

ESTÁ PROHIBIDO:

- Leer archivos .env o .env.*.
- Leer, imprimir o copiar contraseñas y tokens.
- Leer claves privadas, certificados o keystores.
- Leer archivos serviceAccount.json.
- Leer google-services.json o archivos de credenciales.
- Copiar credenciales en el código fuente.
- Subir secretos a GitHub.
- Solicitar al usuario que comparta sus claves privadas.

La aplicación NO debe contener:
- firebaseConfig.
- Firebase Admin SDK.
- FIREBASE_PRIVATE_KEY.
- FIREBASE_WEB_API_KEY.
- Credenciales de servicios externos.

La única configuración pública de entorno permitida
para conectar con el backend es EXPO_PUBLIC_API_URL.

Todo valor EXPO_PUBLIC_ se considera público y visible
para quien inspeccione el APK.

Los tokens de sesión deben guardarse mediante
expo-secure-store, nunca AsyncStorage.

## 4. Límites del espacio de trabajo

- Trabajar exclusivamente dentro de la raíz del repositorio.
- No modificar archivos de otros proyectos.
- No acceder a carpetas personales del usuario.
- No ejecutar comandos con rutas externas.
- No realizar operaciones destructivas sin autorización.
- No borrar archivos ni carpetas sin autorización.
- No ejecutar git reset --hard, git clean -fd
  ni comandos equivalentes sin autorización explícita.

## 5. Acciones que requieren autorización

Solicitar autorización antes de:

- Ejecutar git push.
- Eliminar archivos.
- Modificar configuraciones externas.
- Instalar dependencias adicionales no previstas.
- Ejecutar comandos con efectos fuera del repositorio.
- Acceder a servicios externos.
- Modificar configuraciones de Firebase o Vercel.

## 6. Arquitectura

app/
  _layout.tsx
  (tabs)/
  cita/
  negocio/

src/
  api/
  components/
  db/
  repositories/
  sensors/
  services/

## 7. Calidad del código

- Código legible y mantenible.
- Nombres descriptivos en español.
- Evitar any.
- Evitar código duplicado.
- Manejar errores explícitamente.
- No ignorar errores de TypeScript.
- Mantener accesibilidad en los componentes.
- Todo gesto debe tener una alternativa mediante botones.
- Comprobar disponibilidad y permisos de sensores.

## 8. Validación antes de entregar

- Ejecutar las pruebas correspondientes.
- Revisar errores de TypeScript.
- Comprobar que no se introdujeron secretos.
- Verificar que no existen cambios fuera del repositorio.
- Documentar las decisiones tomadas.

## 9. Forma de trabajo de la IA

Antes de modificar código:
1. Explicar qué se va a modificar.
2. Identificar los archivos afectados.
3. Respetar las restricciones de seguridad.
4. No inventar archivos ni configuraciones existentes.

Después de modificar código:
1. Explicar los cambios.
2. Indicar cómo probarlos.
3. Informar los resultados.
4. Documentar cualquier limitación.

La seguridad tiene prioridad sobre la velocidad de desarrollo.
