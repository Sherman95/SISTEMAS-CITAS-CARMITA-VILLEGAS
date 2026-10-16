# 18. Instrucciones para futuros agentes

## Antes de editar

1. Leer este README, el resumen, estado, contratos y riesgos.
2. Inspeccionar el código y comprobar si el backend/POS están realmente disponibles.
3. Separar hechos comprobados de plan e inferencias.
4. Consultar el contrato API y el modelo de datos antes de cambiar una llamada.

## Módulos críticos

`app.routes.ts`, `auth.service.ts`, `auth.interceptor.ts`, `auth.guard.ts`, `booking.component.ts`, `my-requests.component.ts` y los entornos. Cualquier cambio de sesión o payload puede afectar toda la PWA.

## Reglas obligatorias

- No inventar endpoints, tablas, estados o resultados de pruebas.
- No exponer secretos o datos personales.
- No conectar la PWA directamente a PostgreSQL.
- No auto-vincular cuentas con clientes históricos.
- No modificar POS, esquema, autenticación o calendario sin autorización.
- Usar tipos explícitos para respuestas y errores.
- Mantener cambios quirúrgicos y actualizar documentación relacionada.
- Ejecutar el build y tests dirigidos; registrar fallos reales.

## Cuándo detenerse y solicitar autorización

Cuando falte un repositorio requerido, haya dos contratos razonables, se requiera migración, se toque producción, se cambie persistencia de credenciales o se vaya a usar un servicio externo.

## Después de editar

Revisar diff, verificar rutas/enlaces, ejecutar validaciones, comprobar que no se alteraron archivos fuera de alcance y actualizar estado/riesgos/contratos si corresponde.

