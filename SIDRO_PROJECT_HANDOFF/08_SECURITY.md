# 08. Seguridad

## Controles observados

- El guard protege dashboard y profile mediante un token en memoria.
- El interceptor limita el envío a URLs que empiezan por `environment.apiUrl`.
- Login/registro no reciben el header de autorización según la condición del interceptor.
- Los errores HTTP se propagan; un 401 limpia sesión y navega a login.
- Los formularios tienen validación básica de cliente.

## Riesgos confirmados por inspección

1. El token vive solo en memoria: se pierde al recargar y el modelo de sesión no está documentado para persistencia.
2. El snapshot de `auth.interceptor.ts` contiene una asignación de `Authorization` incompleta/redactada; debe corregirse o verificarse antes de compilar una versión distribuible.
3. Hay tipos `any` en servicios/componentes, reduciendo garantías sobre respuestas externas.
4. El frontend no puede demostrar validación, autorización, hash, expiración, revocación ni protección de datos del backend.

## Riesgos a confirmar

XSS, CSRF, CORS, rate limiting, OTP, almacenamiento de secretos, logs, control de acceso por objeto, SQL injection y privacidad dependen del backend ausente.

No se incluyen tokens, credenciales, datos personales ni cadenas de conexión en este paquete.

