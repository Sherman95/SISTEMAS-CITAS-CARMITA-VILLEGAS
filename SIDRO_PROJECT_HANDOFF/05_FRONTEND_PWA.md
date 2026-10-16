# 05. Frontend PWA

## Rutas registradas

| Ruta | Componente | Protección |
|---|---|---|
| `/` | Welcome | pública |
| `/login` | Login | pública |
| `/register` | Register | pública |
| `/dashboard` | Dashboard | `authGuard` |
| `/profile` | Profile | `authGuard` |
| `**` | redirección a `/` | pública |

Booking y my-requests existen como componentes, pero no están registradas.

## Componentes y responsabilidades

- `WelcomeComponent`: entrada a login/registro.
- `LoginComponent`: formulario reactivo y guardado de token.
- `RegisterComponent`: creación de cuenta.
- `DashboardComponent`: perfil resumido y estado de vinculación.
- `ProfileComponent`: datos de perfil y logout.
- `BookingComponent`: flujo de cuatro pasos: servicio, profesional, fecha/hora y envío.
- `MyRequestsComponent`: consulta y presentación de estados.
- `MobileNavComponent`: enlaces a dashboard y perfil.

## Sesión

`AuthService` mantiene `memoryToken`; no usa localStorage, IndexedDB ni cookies. Un refresco de página pierde la sesión. `authGuard` redirige manualmente a `/login`. El interceptor se aplica globalmente a HttpClient.

## PWA

`provideServiceWorker` solo se habilita fuera de desarrollo. `ngsw-config.json` precarga el shell y carga recursos gráficos de forma diferida. El manifiesto e iconos están en `public/`.

## Pendientes frontend

Registrar rutas faltantes, unificar contratos y tipos, mostrar errores de carga de servicios/profesionales/disponibilidad, añadir tests con providers HTTP/router, revisar el interceptor, completar navegación desde dashboard y comprobar accesibilidad/localización.

