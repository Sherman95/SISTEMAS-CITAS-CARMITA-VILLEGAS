# 15. Problemas y riesgos

## Confirmados

1. Las rutas `booking` y `my-requests` no están en `app.routes.ts`.
2. El dashboard presenta Reservar/Mis Solicitudes como “Próximamente” y deshabilitadas.
3. Los nombres de contratos de disponibilidad y solicitud no coinciden entre componentes y `BookingService`.
4. El interceptor contiene una asignación de `Authorization` incompleta en el contenido accesible; necesita revisión inmediata.
5. La suite de tests falla por providers ausentes (`HttpClient`, `ActivatedRoute`).
6. La sesión en memoria se pierde al recargar.
7. El frontend usa `any` en datos de red y no demuestra validación server-side.

## Hipótesis o riesgos no confirmados

- El backend podría rechazar los payloads actuales.
- El endpoint puede estar duplicando `/api` para `BookingService`.
- La ausencia de revalidación transaccional podría permitir doble reserva.
- El almacenamiento de token elegido en el futuro podría introducir XSS/CSRF si no se diseña.
- La integración de calendario podría carecer de idempotencia.

Estas hipótesis requieren código backend, contratos y pruebas; no se presentan como vulnerabilidades explotables confirmadas.

