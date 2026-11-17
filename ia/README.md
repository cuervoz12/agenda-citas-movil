
# Configuración de IA — Agenda de Citas Móvil

## Propósito

Establecer las reglas de utilización de inteligencia artificial
durante el desarrollo de la aplicación móvil.

## Asistente utilizado

ChatGPT.

## Restricciones

1. No proporcionar archivos .env a la IA.
2. No proporcionar claves privadas ni certificados.
3. No compartir tokens ni contraseñas.
4. Mantener el trabajo dentro del repositorio.
5. Solicitar autorización para acciones externas.
6. No realizar operaciones destructivas sin permiso.
7. Revisar el código generado antes de integrarlo.

## Arquitectura permitida

Expo + React Native + TypeScript.

La aplicación se comunica exclusivamente con la API REST.

Firebase se administra exclusivamente desde el backend.

## Controles verificables

- Reglas de exclusión de archivos sensibles.
- Pruebas automatizadas de configuración.
- Verificación de límites de rutas.
- Revisión de cambios mediante Git.
- Bitácora de utilización de IA.

## Limitación

ChatGPT utilizado desde la web no tiene acceso directo
al sistema de archivos local ni aplica por sí mismo
un aislamiento del repositorio.

Las restricciones de acceso se complementan con controles
del entorno de ejecución y supervisión del usuario.

## Evidencias

Las pruebas se encuentran en:

ia/tests/

La bitácora se encuentra en:

ia/bitacora.md
