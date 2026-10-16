# SIDRO_PROJECT_HANDOFF

Paquete de transferencia técnica generado el 2026-10-15 a partir de una auditoría de lectura del directorio disponible.

## Alcance comprobado

El único código de aplicación accesible es el frontend PWA Angular ubicado en la raíz del proyecto. También está disponible el esquema PostgreSQL sin datos [`pos_carmita_esquema_sin_datos.sql`](../pos_carmita_esquema_sin_datos.sql). No se encontraron dentro de este directorio el backend Node.js, el código del POS, migraciones históricas ni código de Google Calendar. Por ello, las afirmaciones sobre ejecución de esos sistemas se clasifican como `NO VERIFICADO`.

## Lectura recomendada

1. [`19_HANDOFF_SUMMARY.md`](./19_HANDOFF_SUMMARY.md)
2. [`00_PROJECT_OVERVIEW.md`](./00_PROJECT_OVERVIEW.md)
3. [`01_ARCHITECTURE.md`](./01_ARCHITECTURE.md)
4. [`05_FRONTEND_PWA.md`](./05_FRONTEND_PWA.md)
5. [`03_API_CONTRACTS.md`](./03_API_CONTRACTS.md)
6. [`11_IMPLEMENTATION_STATUS.md`](./11_IMPLEMENTATION_STATUS.md)
7. [`12_PENDING_TASKS.md`](./12_PENDING_TASKS.md)
8. [`15_KNOWN_ISSUES_AND_RISKS.md`](./15_KNOWN_ISSUES_AND_RISKS.md)
9. [`18_AI_AGENT_INSTRUCTIONS.md`](./18_AI_AGENT_INSTRUCTIONS.md)

## Índice

| Documento | Propósito |
|---|---|
| [00_PROJECT_OVERVIEW](./00_PROJECT_OVERVIEW.md) | Alcance, usuarios, tecnologías y límites de la auditoría. |
| [01_ARCHITECTURE](./01_ARCHITECTURE.md) | Arquitectura demostrada y arquitectura planificada. |
| [02_DATABASE](./02_DATABASE.md) | Estado de acceso al esquema y reglas documentales. |
| [03_API_CONTRACTS](./03_API_CONTRACTS.md) | URLs consumidas por la PWA y discrepancias observadas. |
| [04_BUSINESS_RULES](./04_BUSINESS_RULES.md) | Reglas visibles en UI y reglas únicamente planificadas. |
| [05_FRONTEND_PWA](./05_FRONTEND_PWA.md) | Rutas, componentes, servicios, formularios y sesión. |
| [06_BACKEND](./06_BACKEND.md) | Evidencia disponible y preguntas para el backend ausente. |
| [07_POS_INTEGRATION](./07_POS_INTEGRATION.md) | Integración planificada, no comprobable en este checkout. |
| [08_SECURITY](./08_SECURITY.md) | Controles observados y riesgos que requieren revisión. |
| [09_AVAILABILITY_ENGINE](./09_AVAILABILITY_ENGINE.md) | Consumidor de disponibilidad y garantías no demostradas. |
| [10_GOOGLE_CALENDAR](./10_GOOGLE_CALENDAR.md) | Estado de la integración de calendario. |
| [11_IMPLEMENTATION_STATUS](./11_IMPLEMENTATION_STATUS.md) | Matriz de estado basada en evidencia. |
| [12_PENDING_TASKS](./12_PENDING_TASKS.md) | Trabajo priorizado y dependencias. |
| [13_TESTING_STRATEGY](./13_TESTING_STRATEGY.md) | Pruebas existentes, fallos y estrategia objetivo. |
| [14_DEPLOYMENT_AND_ENVIRONMENT](./14_DEPLOYMENT_AND_ENVIRONMENT.md) | Instalación, entornos y despliegue sin secretos reales. |
| [15_KNOWN_ISSUES_AND_RISKS](./15_KNOWN_ISSUES_AND_RISKS.md) | Hallazgos confirmados, hipótesis y riesgos. |
| [16_DECISION_LOG](./16_DECISION_LOG.md) | Decisiones documentadas y evidencia. |
| [17_NEXT_STEPS](./17_NEXT_STEPS.md) | Secuencia recomendada para continuar. |
| [18_AI_AGENT_INSTRUCTIONS](./18_AI_AGENT_INSTRUCTIONS.md) | Guía operativa para futuros agentes. |
| [19_HANDOFF_SUMMARY](./19_HANDOFF_SUMMARY.md) | Transferencia ejecutiva y próxima tarea. |

## Convenciones

- **COMPROBADO:** visible en archivos accesibles o resultado de un comando ejecutado.
- **DOCUMENTADO:** aparece en planificación, pero no prueba implementación.
- **NO VERIFICADO:** no hay código, configuración o resultado que permita afirmarlo.
- No se incluyen credenciales, tokens, datos de clientes ni cadenas de conexión.
