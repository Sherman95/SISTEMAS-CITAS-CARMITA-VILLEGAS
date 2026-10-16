# 10. Google Calendar

No hay SDK, credenciales, OAuth, rutas, jobs, adaptadores ni código de Google Calendar en el checkout. El esquema sí contiene `google_calendars`, `appointment_google_events` y `google_calendar_sync_queue`, además de `appointments.google_event_id`. Esto demuestra persistencia prevista para la integración, pero no el flujo de aplicación.

## Estado

**PARCIALMENTE DOCUMENTADA / NO VERIFICADA EN EJECUCIÓN.** El esquema demuestra calendario asociado a empleados, relación cita-evento única por cita/calendario y una cola con `status`/`attempts`; no demuestra creación de eventos, reintentos efectivos, idempotencia completa, sincronización o recuperación ante fallos.

## Contrato que debe definirse cuando exista el backend

- Cuándo una solicitud pasa a cita confirmada.
- Qué sistema es fuente de verdad.
- Identificador de evento y relación persistida.
- Zona horaria y formato de inicio/fin.
- Idempotency key para reintentos.
- Estados de sincronización y reconciliación.
- Tratamiento de cancelación y actualización.
- Cuenta/credencial usada y rotación segura.

No deben documentarse secretos reales ni probarse contra calendarios productivos sin autorización explícita.

## Resultado P0

El backend local quedó configurado con `GOOGLE_CALENDAR_ENABLED=false`. El
worker no inicia su intervalo y el cliente Google retorna `null` mientras la
bandera esté deshabilitada. No se utilizaron credenciales ni se enviaron
eventos a Google durante esta fase.
