# 13. Estrategia de pruebas

## Evidencia actual

El proyecto contiene specs de App, Dashboard, Login, Register, Profile, MobileNav y Welcome. Solo comprueban creación, salvo expectativas básicas de App. No hay specs visibles para BookingService, AuthService, interceptor, guard, booking o requests.

`npm run build` fue exitoso. `npm test -- --watch=false --browsers=ChromeHeadless` ejecutó 9 tests y falló 6: los tests de componentes con servicios no configuran `HttpClient`; los que usan enlaces/router no configuran `ActivatedRoute`. Esto es un resultado de auditoría, no una modificación.

## Pirámide recomendada

1. **Unitarias:** validadores, mapeo de estados, guard, interceptor, servicios y componentes.
2. **Integración:** API con base de datos de prueba, transacciones, permisos y conflictos.
3. **Concurrencia:** solicitudes simultáneas y reintentos.
4. **Seguridad:** acceso horizontal, tokens expirados, payloads inválidos, rate limiting y CORS.
5. **E2E:** navegador móvil y desktop en entorno aislado.

## Flujo E2E obligatorio

```mermaid
flowchart LR
  A[Registro] --> B[Autenticación]
  B --> C[Selección de servicio]
  C --> D[Disponibilidad]
  D --> E[Solicitud]
  E --> F[Gestión administrativa]
  F --> G[Confirmación]
  G --> H[Calendario]
```

Cada paso debe probar éxito, errores, permisos, refresco y reintento. Los pasos F y H no pueden ejecutarse con el checkout actual.

