# 03. Contratos API

## Contrato verificado en P1

La PWA usa `environment.apiUrl = http://localhost:3000/api`; los servicios
construyen las rutas como `${apiUrl}/sidro/...`, sin duplicar `/api`. Los IDs
de servicios, profesionales y cuentas son UUID (`string`); el ID de
`sidro_appointment_requests` es INTEGER (`number`).

| Método | Ruta | Entrada/respuesta |
|---|---|---|
| POST | `/api/sidro/login` | Login SIDRO con respuesta de token |
| POST | `/api/sidro/register` | Registro de cuenta |
| GET | `/api/sidro/public/services` | Catálogo con duración y padding |
| GET | `/api/sidro/public/services/:id/professionals` | Profesionales del servicio |
| GET | `/api/sidro/availability` | Query `service_id`, `employee_id`, `request_date`; respuesta `string[]` |
| POST | `/api/sidro/requests` | `{ service_id, employee_id, request_date, start_time }` |
| GET | `/api/sidro/requests` | Solicitudes con `id`, fechas/horas, nombres y estado |

Estados persistidos consumidos sin renombrar: `PENDIENTE`, `PROPUESTA`,
`APROBADA_PENDIENTE_VINCULACION`, `CONFIRMADA`, `RECHAZADA`, `CANCELADA` y
`CONFLICTO_VINCULACION`.

Las incompatibilidades de doble `/api`, `date/time` y rutas no registradas
quedaron corregidas en P1. El backend también devuelve `end_time` en el
listado de solicitudes para completar el contrato.

## Validación funcional P2

- Las rutas `/login`, `/register`, `/dashboard`, `/profile`, `/booking` y
  `/my-requests` están declaradas; las páginas autenticadas usan `authGuard`.
- El dashboard y la navegación móvil enlazan al asistente y al listado.
- Las propuestas usan exclusivamente `POST /api/sidro/requests/:id/accept-proposal`
  y `POST /api/sidro/requests/:id/reject-proposal`.
- El listado recibe `proposed_date`, `proposed_start_time` y
  `proposed_end_time`; la interfaz muestra y gestiona la alternativa.
- El asistente mantiene `BookingService` como única capa HTTP, muestra estados
  de carga/error y bloquea envíos repetidos.

Los endpoints anteriores fueron cotejados con las rutas reales del backend
durante P1 y P2. No quedan incompatibilidades conocidas en las rutas de la
PWA, el payload de solicitudes ni las acciones de propuestas.
- `app.routes.ts` no declara rutas `booking` ni `my-requests`, aunque el componente booking navega a `/my-requests`.
- El interceptor debe adjuntar autorización, pero el snapshot accesible contiene una línea de header incompleta/redactada; requiere revisión antes de confiar en el contrato.

## No verificado

Códigos HTTP, paginación, errores, roles, validación server-side, idempotencia y formato JSON real.
