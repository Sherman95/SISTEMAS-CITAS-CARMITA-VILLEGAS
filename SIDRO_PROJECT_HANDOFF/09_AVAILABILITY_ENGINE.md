# 09. Motor de disponibilidad

## Lo que hace la PWA

La PWA solicita `GET /sidro/availability` con `employee_id`, `service_id` y fecha. Recibe un array de strings y permite elegir una hora. La fecha mínima se calcula en el navegador. El servicio alternativo usa `request_date`, lo que revela una incompatibilidad de contrato.

## Evidencia del esquema

El dump SQL confirma `sidro_employee_schedules` (rangos de trabajo), `sidro_employee_blocks` (bloqueos), `sidro_service_professionals.specific_duration_minutes`, `items.duration_minutes`, `items.padding_minutes`, `employee_working_hours`, `employee_time_blocks` y exclusiones GiST para horarios superpuestos. También existe una exclusión para `appointment_requests` en estado `PENDIENTE_VINCULACION`.

## Lo que no está implementado aquí

No hay algoritmo de aplicación, consulta SQL del backend, política de zona horaria, combinación demostrada de citas/bloqueos/descansos ni transacción de reserva. `duration_minutes` se muestra en la tarjeta de servicio, pero no se calcula en frontend. La tabla `sidro_appointment_requests` no tiene en el dump una exclusión de intervalos equivalente a la de `appointment_requests`, por lo que su protección concurrente requiere confirmación del backend.

## Garantías

No hay garantías de concurrencia demostradas. La disponibilidad mostrada puede quedar obsoleta antes del POST; el backend debe revalidar atómicamente servicio, profesional, rango horario y conflictos.

## Pruebas necesarias

- Duraciones que cruzan descansos y cierre.
- Zonas horarias y cambios de horario.
- Dos solicitudes simultáneas para el mismo intervalo.
- Reintentos y doble clic.
- Solicitud con disponibilidad ya consumida.
- Profesional no habilitado para el servicio.
