# 11. Estado de implementación

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Shell Angular standalone | IMPLEMENTADA Y VERIFICADA | `src/main.ts`, `src/app/app.config.ts`; build exitoso. |
| Welcome, login y registro | PARCIALMENTE IMPLEMENTADA | Componentes y formularios existen; tests no pasan por TestBed incompleto. |
| Token en memoria | IMPLEMENTADA SIN PRUEBAS | `src/app/services/auth.service.ts`. |
| Guard de rutas | IMPLEMENTADA SIN PRUEBAS | `src/app/auth.guard.ts`. |
| Interceptor de autorización | IMPLEMENTADA SIN PRUEBAS | `src/app/auth.interceptor.ts`; snapshot requiere revisar header incompleto. |
| Dashboard/profile | PARCIALMENTE IMPLEMENTADA | Consultan profile; tests fallan por `HttpClient` ausente. |
| Servicios/profesionales | PARCIALMENTE IMPLEMENTADA | Booking las consulta, pero no tiene ruta registrada. |
| Disponibilidad | PARCIALMENTE IMPLEMENTADA | Consumidor existe; contrato difiere entre componente y servicio. |
| Crear solicitud | PARCIALMENTE IMPLEMENTADA | POST existe; payload difiere de `BookingService`. |
| Mis solicitudes | PARCIALMENTE IMPLEMENTADA | Componente existe; ruta no registrada y usa tipos `any`. |
| Estados de solicitud | IMPLEMENTADA SIN PRUEBAS | Etiquetas y formato en `my-requests.component.ts`. |
| Esquema PostgreSQL | IMPLEMENTADA SIN PRUEBAS | `pos_carmita_esquema_sin_datos.sql`: 27 tablas, FKs, checks, índices y trigger; no se ejecutó. |
| Vinculación POS | PARCIALMENTE IMPLEMENTADA | El esquema contiene `sidro_client_accounts`, `sidro_account_links`, `clients` y FKs restrictivas; no hay UI/backend verificable. |
| Roles y permisos | NO VERIFICABLE | No hay implementación accesible. |
| Horarios, descansos y conflictos | PARCIALMENTE IMPLEMENTADA | Hay tablas SIDRO, checks y exclusiones GiST; no hay motor backend ni prueba de concurrencia. |
| Google Calendar | PARCIALMENTE IMPLEMENTADA | Hay tablas de calendarios/eventos/cola; no hay código de integración ejecutable. |
| PWA/service worker | IMPLEMENTADA SIN PRUEBAS | `app.config.ts`, `ngsw-config.json`, `public/manifest.webmanifest`. |
| Tests unitarios | IMPLEMENTADA SIN PRUEBAS | Hay 9 specs; ejecución observada: 6 fallos por providers. |
| Despliegue real | NO VERIFICABLE | Solo configuración genérica y URLs ficticias. |

La clasificación no declara fases completas basándose únicamente en `masterplandev.md`.
