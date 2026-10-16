# 07. Integración con POS

## Estado

El repositorio/código del POS no está presente, pero ahora sí existe un esquema PostgreSQL sin datos en [`pos_carmita_esquema_sin_datos.sql`](../pos_carmita_esquema_sin_datos.sql). El esquema confirma tablas compartidas de clientes, empleados, items, citas, ventas y usuarios, además de tablas SIDRO para cuentas, vínculos, solicitudes y disponibilidad. No permite verificar pantallas, controladores, permisos de aplicación ni procesos completos del POS.

## Plan documentado

El plan conserva el POS existente y propone módulos para solicitudes, vinculación de cuentas, duplicados, horarios, bloqueos, parámetros y permisos. La vinculación de una cuenta digital a un cliente histórico debe ser exclusivamente administrativa.

## Restricciones de integración

- No asumir que coincidencia de nombre, teléfono o correo prueba identidad.
- No escribir en `clients` sin una operación administrativa explícita.
- Antes de fusionar, enumerar claves foráneas y relaciones con citas/ventas/pagos.
- Mantener auditoría y transacciones.
- Probar con una copia anonimizada y nunca con producción durante desarrollo.
- Resolver antes de implementar la coexistencia de `appointment_requests` y `sidro_appointment_requests`.
- Usar `sidro_account_links` como relación explícita; sus FKs a `clients` y `sidro_client_accounts` son restrictivas.

## Evidencia requerida

Repositorio POS, módulos de citas, autenticación y configuración de despliegue. El esquema ya está disponible, pero no sustituye el código de aplicación ni las migraciones históricas.
