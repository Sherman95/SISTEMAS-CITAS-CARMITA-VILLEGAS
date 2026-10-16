# 06. Backend

## Evidencia

No hay directorio Node.js/Express, controladores, middlewares, modelos, validadores ni configuración de servidor en el checkout. La PWA solo consume URLs configuradas en [`environment.ts`](../src/environments/environment.ts).

## Interfaz que el backend debe aclarar

Consultar [`03_API_CONTRACTS.md`](./03_API_CONTRACTS.md). Deben confirmarse rutas, prefijo `/api`, nombres de parámetros (`date` frente a `request_date`), payload (`time` frente a `start_time`), forma de token, errores y permisos.

## Requisitos documentados como plan

`masterplandev.md` propone Node.js, Express, TypeScript, PostgreSQL, JWT, validación server-side y que todas las operaciones importantes se validen en backend. No existe evidencia para afirmar que estén implementados.

## Acciones previas a cualquier integración

1. Obtener repositorio backend autorizado.
2. Mapear rutas reales a llamadas de la PWA.
3. Revisar middleware de autenticación/autorización.
4. Confirmar transacciones de solicitudes y conflictos.
5. Ejecutar pruebas de contrato contra un entorno no productivo.

