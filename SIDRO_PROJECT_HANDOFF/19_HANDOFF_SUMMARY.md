# 19. Resumen de transferencia

## Situación actual

La PWA Angular 18 compila, con login/registro, perfil, dashboard, navegación
protegida, asistente de reservas y gestión de solicitudes/propuestas. El
backend y POS están disponibles para validación local. La suite P2 queda verde
con 17 pruebas.

La fase P0 de integración local verificó el destino
`localhost:5432/poscarmitaVlocal`, creó un respaldo actualizado y desactivó el
worker/cliente externo de Google Calendar para pruebas locales.

## Estado P4

Se completó una ejecución E2E local con backend, POS y PWA simultáneos. El
flujo registro → login → reserva → recepción administrativa → vinculación →
aprobación creó una única cita oficial y mostró `CONFIRMADA` en la PWA. Un
segundo flujo verificó `PENDIENTE` → `PROPUESTA` → `CANCELADA` al rechazar una
propuesta alternativa. La bandeja administrativa y la configuración SIDRO
quedaron verificadas visualmente tras corregir errores `NG0100` de detección de
cambios.

La regresión visual de clientes, profesionales, catálogo, citas, historial y
caja cargó correctamente. El guard de la PWA redirigió el acceso sin sesión.
No se contactó Google Calendar, no se ejecutaron migraciones y no se publicó
ningún cambio. Todos los fixtures P4 fueron eliminados y el servicio temporal
fue restaurado a su configuración original.

## Estado P5

Se ejecutaron las pruebas finales locales:

- Aceptación de propuesta: `PROPUESTA` → `CONFIRMADA`, con nueva
  disponibilidad y exactamente una cita oficial.
- Concurrencia: dos aprobaciones simultáneas incompatibles produjeron una
  respuesta 200 y una 409, sin solapamiento.
- Calendar simulado: fallo de red → `FAILED`, retry → `COMPLETED`, e
  idempotencia con una sola fila de evento.
- Seguridad: secreto JWT obligatorio en producción, `force` restringido a
  administradores y CORS con allowlist.
- Fixtures P5 eliminados y servicio temporal restaurado.

La clasificación final es **NO LISTO PARA PRODUCCIÓN**. El flujo local está
funcional, pero siguen abiertos la migración de contraseñas POS heredadas, el
rate limiting, la certificación operativa de Calendar con un entorno aislado y
la prueba del endpoint de eliminación contra un cliente simulado integrado.

## Estado P2

Las rutas autenticadas `/dashboard`, `/profile`, `/booking` y `/my-requests`
usan `authGuard`. `BookingService` centraliza las llamadas SIDRO y las
propuestas consumen únicamente los endpoints reales de aceptación y rechazo.
No se modificaron SQL, datos, Calendar ni servicios externos.

## Riesgos principales

- Interceptor de autorización incompleto en el snapshot accesible.
- La sincronización real con Calendar permanece intencionalmente sin probar
  hasta disponer de un simulador o proyecto aislado.
- Las pruebas de concurrencia de aprobaciones se mantienen cubiertas por la
  suite runtime P3, pero no se automatizaron visualmente en Playwright.
- Calendar permanece aislado para pruebas locales.
- No se debe interpretar la validación local como autorización de despliegue.
- La limitación de rate limiting debe conservarse con un store compartido si se
  despliega en múltiples instancias.

## Próxima tarea recomendada

P5 quedó validada para aceptación local, pero no autoriza publicación. Antes de
producción todavía se requiere completar los riesgos abiertos, revisión de
seguridad y aprobación explícita del despliegue.

## Estado P6

Se corrigieron los bloqueadores principales para una futura publicación:

- `JWT_SECRET` es obligatorio y no admite fallback inseguro.
- Las rutas POS críticas quedaron protegidas por JWT.
- Google Calendar administrativo quedó restringido a administradores.
- El rate limiting quedó respaldado por PostgreSQL local.
- Se añadió hardening base con `helmet` y allowlist CORS.
- La validación móvil se ejecutó en viewport tipo iPhone, con capturas.
- La eliminación de citas preserva los vínculos de Calendar antes del borrado
  local para evitar pérdida de sincronización.

La clasificación final es **LISTO CON RESTRICCIONES**. El sistema ya no tiene
los bloqueadores de seguridad detectados en P5, pero todavía requiere:

1. Completar la migración de contraseñas heredadas remanentes del POS.
2. Certificar Calendar con un sandbox o proyecto aislado.
3. Validar manualmente la experiencia móvil en el dispositivo objetivo.
4. Mantener `GOOGLE_CALENDAR_ENABLED=false` hasta la certificación externa.

## Navegación

Consulte [`11_IMPLEMENTATION_STATUS.md`](./11_IMPLEMENTATION_STATUS.md), [`12_PENDING_TASKS.md`](./12_PENDING_TASKS.md), [`13_TESTING_STRATEGY.md`](./13_TESTING_STRATEGY.md) y [`18_AI_AGENT_INSTRUCTIONS.md`](./18_AI_AGENT_INSTRUCTIONS.md).
