# 00. Descripción general

## Estado de la auditoría

La evidencia accesible es una aplicación Angular 18 standalone denominada `sidro-frontend` y un dump PostgreSQL sin datos. El plan [`masterplandev.md`](../masterplandev.md) describe un ecosistema mayor: POS Angular, API Node/Express/TypeScript, PostgreSQL y Google Calendar. No están presentes el backend, el código del POS ni la integración ejecutable de Google Calendar.

## Objetivo funcional

Según el plan, SIDRO debe permitir registro, autenticación, consulta de servicios/profesionales, disponibilidad, solicitudes de citas y gestión administrativa de vinculación con clientes históricos. En el código actual se observan formularios de registro/login, perfil, dashboard, un flujo de reserva y una vista de solicitudes; parte de ellos no está conectada a rutas.

## Tecnologías comprobadas

- Angular CLI `18.2.21` y Angular `^18.2.0`.
- TypeScript `~5.5.2`, RxJS `~7.8.0`, SCSS.
- Angular Router, Reactive Forms, HttpClient y Service Worker.
- Jasmine/Karma para tests.
- `environment.ts`: API ficticia local `http://localhost:3000/api`.
- `environment.prod.ts`: API ficticia `https://api.tudominio.com/api`.

## Límites

No se ejecutó la base de datos ni se inspeccionaron backend, POS, despliegues reales, secretos, calendarios externos ni datos personales. El esquema se analizó estáticamente; este paquete no declara terminada ninguna fase que requiera código de aplicación o servicios externos.

## Resultado de validación

- `npm run build`: **COMPROBADO**, finaliza correctamente y genera `dist/sidro-frontend`.
- `npm test -- --watch=false --browsers=ChromeHeadless`: **NO VERIFICADO como suite exitosa**; se ejecutan 9 tests y fallan 6 por configuración incompleta de TestBed. Detalle en [`13_TESTING_STRATEGY.md`](./13_TESTING_STRATEGY.md).
