# 14. Entorno y despliegue

## Requisitos comprobados

- Node.js compatible con Angular CLI 18.
- Dependencias declaradas en `package.json` y lockfile existente.
- Navegador Chromium para los tests Karma.

## Comandos observados

```text
npm install
npm start
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

`npm install` no fue ejecutado durante esta auditoría porque ya existía `node_modules` y no se autorizó instalar dependencias.

## Configuración

- Desarrollo: `http://localhost:3000/api` (valor de ejemplo presente).
- Producción: `https://api.tudominio.com/api` (placeholder).
- Service Worker: habilitado solo fuera de desarrollo.

Para un despliegue real deben definirse valores mediante el mecanismo aprobado por el equipo; no introducir secretos en el bundle. Los valores anteriores no son endpoints productivos verificados.

## Respaldo y recuperación

No hay scripts ni procedimiento accesible para API, POS, PostgreSQL o calendarios. Deben documentarse por sus responsables antes de declarar un procedimiento operativo.

## P0 de integración local

El backend compartido fue verificado contra `localhost:5432/poscarmitaVlocal`
sin revelar credenciales ni ejecutar migraciones. Se creó el respaldo local
`D:/Documents/pos-carmita-villegas/backend/backup_p0_local_20261015_203528.sql`.
El entorno local tiene `GOOGLE_CALENDAR_ENABLED=false`; el worker y el cliente
Google quedan desactivados para evitar efectos externos. No se inició el
servidor en P0.
