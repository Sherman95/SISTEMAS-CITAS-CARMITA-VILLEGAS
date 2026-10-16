# SIDRO · Carmita Villegas

Aplicación web progresiva para que las clientas de Carmita Villegas consulten servicios, soliciten citas y revisen su estado.

## Funcionalidades

- Registro e inicio de sesión de clientas.
- Catálogo de servicios compartido con el POS.
- Selección de profesional, fecha y horario disponible.
- Detalle obligatorio de lo que desea realizarse la clienta.
- Seguimiento de solicitudes pendientes, propuestas y citas confirmadas.
- Perfil y vinculación con el historial de clientes del POS.
- Interfaz adaptable para escritorio y móvil.
- PWA con manifiesto y service worker.

## Requisitos locales

- Node.js 20 o superior.
- npm 10 o superior.
- Backend POS disponible en `http://localhost:3000`.

## Desarrollo

```bash
npm ci
npm start
```

La aplicación se abrirá en `http://localhost:4200` y utilizará `http://localhost:3000/api`.

## Verificación

```bash
npm run build
npm test -- --watch=false
```

## Despliegue en Vercel

El repositorio ya incluye [`vercel.json`](./vercel.json) con:

- Instalación reproducible mediante `npm ci`.
- Compilación Angular de producción.
- Directorio público `dist/sidro-frontend/browser`.
- Fallback de rutas para la SPA.
- Proxy de `/api/*` hacia el backend público del POS en Render.
- Encabezados básicos de seguridad y control de caché del service worker.

Para desplegar:

1. Importa este repositorio en Vercel.
2. Conserva la detección automática de Angular.
3. Pulsa **Deploy**; no se requieren secretos en el frontend.

La compilación de producción utiliza `/api`, por lo que las clientas no llaman directamente al dominio de Render. Si cambia la URL pública del backend, actualiza solamente la primera regla de `rewrites` en `vercel.json`.

El backend de destino debe tener desplegadas las rutas `/api/sidro/*`. Publicar este frontend no despliega ni modifica el backend POS.

## Estructura principal

```text
src/app/components/   Pantallas de la PWA
src/app/services/     Autenticación y reservas
src/environments/     Configuración local y de producción
public/               Logo, iconos y manifiesto
vercel.json           Configuración de despliegue
```

## Seguridad

- No se incluyen credenciales, tokens ni variables privadas.
- El token SIDRO se conserva únicamente en memoria.
- Las rutas privadas utilizan guard e interceptor de autenticación.
- El backend continúa siendo responsable de autorización, validación y persistencia.
