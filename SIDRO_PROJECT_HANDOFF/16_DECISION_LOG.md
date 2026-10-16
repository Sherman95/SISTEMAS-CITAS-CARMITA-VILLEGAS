# 16. Registro de decisiones

| Decisión | Estado/evidencia | Consecuencia |
|---|---|---|
| Usar Angular standalone | Comprobada en componentes y `main.ts`. | No existe módulo raíz tradicional. |
| Usar PWA/service worker | Comprobada en `app.config.ts` y `ngsw-config.json`. | El worker solo se registra fuera de dev. |
| Mantener token en memoria | Comentario y código de `AuthService`. | Se evita persistencia, pero se pierde la sesión al recargar. |
| API bajo `environment.apiUrl` | Comprobada en servicios/componentes. | Requiere un contrato único de prefijo. |
| Separar cuenta digital y cliente POS | Documentada en `masterplandev.md` y reflejada por `sidro_client_accounts`/`sidro_account_links` en el esquema. | La regla de operación y autorización aún requieren backend/POS. |
| Vinculación solo administrativa | Documentada en `masterplandev.md`. | Debe preservarse al integrar el POS. |
| Reutilizar POS/backend existentes | Documentada en `masterplandev.md`. | No crear un POS alternativo sin evidencia y autorización. |

No se inventan fechas, autores ni motivos no presentes en los archivos accesibles.
