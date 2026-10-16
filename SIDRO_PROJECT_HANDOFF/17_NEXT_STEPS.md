# 17. Próximos pasos

## Fase 1: cerrar el alcance

1. Obtener rutas autorizadas del backend, POS y migraciones históricas; el esquema base ya está disponible.
2. Repetir inventario excluyendo `node_modules`, `dist` y cachés.
3. Comparar contratos reales con [`03_API_CONTRACTS.md`](./03_API_CONTRACTS.md).

## Fase 2: estabilizar la PWA

1. Reparar/verificar interceptor.
2. Registrar y proteger las rutas de booking/requests.
3. Unificar DTOs y prefijos API.
4. Añadir estados de error y tests HTTP/router.

## Fase 3: integración segura

1. Confirmar tablas y transacciones.
2. Implementar vinculación manual y auditoría en el módulo correcto del POS.
3. Probar permisos por rol y conflictos concurrentes.

## Fase 4: calendario y operación

1. Diseñar idempotencia y reconciliación.
2. Probar con credenciales y calendarios de sandbox.
3. Documentar despliegue, respaldo y recuperación.

Cada fase requiere build/tests y actualización de este paquete. Si una decisión cambia contratos, esquema, autenticación, datos productivos o servicios externos, solicitar aprobación humana antes de editar.
