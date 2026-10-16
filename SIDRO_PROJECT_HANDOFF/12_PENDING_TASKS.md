# 12. Tareas pendientes priorizadas

| Prioridad | Tarea | Dependencias | Criterio de aceptación |
|---|---|---|---|
| P0 | Obtener backend/POS y migraciones históricas autorizados | Acceso del responsable | Inventario reproducible que explique el esquema ya entregado y sus dos tablas de solicitudes. |
| P0 | Revisar y reparar el interceptor | Confirmar contrato JWT | Build y test que prueben header solo en API autorizada. |
| P0 | Unificar contratos de booking | Especificación backend | Un solo prefijo y nombres de fecha/hora en componente, servicio y API. |
| P0 | Registrar rutas booking/requests | Decisión UX | Navegación desde dashboard y guard funcionando. |
| P0 | Corregir TestBed | Ninguna | Los 9 specs ejecutan y los tests relevantes cubren HTTP/router. |
| P1 | Tipar DTOs y errores | Contrato API | Sin `any` en superficies de red críticas. |
| P1 | Implementar revalidación/concurrencia backend | Esquema y API | Dos solicitudes simultáneas no crean conflicto. |
| P1 | Documentar vinculación administrativa | POS y modelo real | Flujo auditado, reversible y sin auto-vinculación. |
| P1 | Definir seguridad de sesión | Backend y decisión humana | Expiración, renovación, logout y almacenamiento documentados. |
| P2 | Implementar roles, horarios y estados | Backend/POS | Matriz de permisos y transiciones probadas. |
| P2 | Integrar Google Calendar | Credenciales de entorno de prueba | Idempotencia, reintentos y reconciliación comprobados. |
| P2 | E2E del flujo completo | Todos los anteriores | Registro → autenticación → disponibilidad → solicitud → administración → confirmación → calendario. |

No instalar dependencias ni modificar contratos hasta obtener autorización y evidencia del backend real.
