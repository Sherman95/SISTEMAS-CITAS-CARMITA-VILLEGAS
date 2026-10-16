# 02. Base de datos

## Fuente auditada

Ahora existe el esquema PostgreSQL sin filas [`pos_carmita_esquema_sin_datos.sql`](../pos_carmita_esquema_sin_datos.sql). Es un dump generado con PostgreSQL/pg_dump 18.3 el 2026-10-15; no se ejecutó durante esta auditoría. Las referencias de líneas corresponden a ese archivo.

El dump declara 27 tablas, extensiones `btree_gist` y `pgcrypto`, los tipos `item_tipo` y `timerange`, una función PL/pgSQL y un trigger. Los bloques `COPY` están sustituidos por comentarios, por lo que no contiene filas de clientes.

## Tablas del POS/base compartida

Estas tablas no tienen prefijo `sidro_` y se consideran parte del modelo existente o compartido; la separación histórica debe confirmarse con el repositorio POS:

- `clients`: `id`, `nombre`, `telefono`, `email`, `ultima_visita`, `created_at`, `updated_at`, `cedula`, `direccion`.
- `employees`: identidad y estado de profesionales.
- `items`: servicios/productos, precio, tipo, duración, `is_reservable` y `padding_minutes`.
- `appointments`: cita con cliente, servicio, profesional, inicio/fin, estado y `google_event_id`.
- `employee_services`, `employee_working_hours`, `employee_time_blocks`: relaciones y disponibilidad base.
- `users`: usuarios administrativos con rol `admin`/`user`, estado y vínculo opcional a empleado.
- `sales`, `sale_details`, `sale_receipts`, `payment_history`: ventas y pagos.
- `cash_registers`, `business_config`, `expenses`, `expense_categories`.

También existen `google_calendars`, `appointment_google_events` y `google_calendar_sync_queue`, que relacionan calendario y citas.

## Tablas SIDRO identificadas

### Identidad y vinculación

- `sidro_client_accounts`: `id uuid`, `nombre_completo`, `telefono`, `email`, `password_hash`, `is_active`, timestamps. Teléfono y email tienen restricciones `UNIQUE` (el email permite NULL).
- `sidro_account_links`: cuenta SIDRO, `client_id`, `admin_id`, fecha de vinculación e `is_active`. Tiene FKs a `sidro_client_accounts`, `clients` y `users`; los vínculos activos tienen índices únicos parciales por cuenta y por cliente.
- `password_reset_tokens`: referencia a cuenta SIDRO y administrador, hash del token, uso, expiración y timestamps.

### Reservas y disponibilidad

- `sidro_appointment_requests`: `id integer`, cuenta, `service_id`, profesional, fecha/hora solicitada, estado, cita oficial y propuesta alternativa. Su estado por defecto es `PENDIENTE`; el dump no añade un `CHECK` de estados a esta tabla.
- `appointment_requests`: segunda tabla de solicitudes, con timestamps con zona horaria, `item_id`, rango deseado, notas y estado restringido a `PENDIENTE`, `PENDIENTE_VINCULACION`, `CONFIRMADA`, `RECHAZADA`, `CANCELADA`, `CADUCADA` y `PROPUESTA_CAMBIO`. Tiene una exclusión GiST para solicitudes `PENDIENTE_VINCULACION`.
- `sidro_employee_schedules`: día de semana 0–6 y rango horario; tiene `CHECK` de orden y exclusión GiST contra rangos superpuestos del mismo profesional.
- `sidro_employee_blocks`: bloqueos por fecha, hora opcional, motivo y tipo.
- `sidro_service_professionals`: relación única entre servicio y profesional, con duración específica opcional.

La coexistencia de `appointment_requests` y `sidro_appointment_requests` es una decisión pendiente de aclarar en el backend; no debe elegirse una tabla por nombre sin revisar controladores y migraciones.

## Integridad, índices y automatismos

- PK en las 27 tablas.
- Únicos relevantes: `clients.cedula`, `clients.email`, `users.username`, `business_config.config_key`, `google_calendars.calendar_id`, `sidro_client_accounts.telefono`, `sidro_client_accounts.email`, y la pareja servicio-profesional.
- FKs conectan solicitudes con cuentas, servicios, empleados y citas; vínculos SIDRO con cuentas, `clients` y `users`; citas con clientes, empleados e items.
- `sidro_account_links` usa `ON DELETE RESTRICT`, protegiendo los vínculos activos de borrados directos.
- `sidro_employee_schedules` tiene `trg_check_schedule_overlap` antes de INSERT/UPDATE, además de la exclusión GiST.
- `appointment_requests` tiene exclusión GiST sobre el rango solicitado únicamente cuando el estado es `PENDIENTE_VINCULACION`.
- `sidro_appointment_requests` tiene índices por cuenta y por profesional/fecha, pero el dump no muestra una exclusión equivalente para sus solicitudes.

## Reglas observadas

Hay checks para fechas/horas de fin posteriores al inicio, precios y cantidades no negativos, estados de caja, días de semana, cédula de 10 o 13 caracteres y tipos de bloqueos. La ausencia de un `CHECK` en `sidro_appointment_requests.status` no implica que cualquier estado sea válido: el backend debe definirlo.

## Límites

El esquema no demuestra funciones de negocio completas, permisos de PostgreSQL, RLS, transacciones de aplicación ni datos existentes. No se ejecutó ninguna migración ni se conectó una base de datos.
