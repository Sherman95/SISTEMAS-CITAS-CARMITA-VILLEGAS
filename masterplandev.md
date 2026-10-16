# PLAN MAESTRO DE DESARROLLO
## Sistema integral de reservas online — Carmita Villegas
**Proyecto:** Portal PWA de reservas y ampliación del POS existente  
**Prioridad:** Alta  
**Modalidad:** Desarrollo incremental sobre la infraestructura existente  
**Objetivo:** Implementar un portal de reservas para clientas, integrado con el sistema administrativo actual, manteniendo la seguridad y privacidad de los datos.

---

# 1. CONTEXTO DEL PROYECTO

Actualmente, Carmita Villegas dispone de un sistema POS que permite administrar clientas, profesionales, servicios, ventas y citas.

Según la documentación existente, su arquitectura es:

| Componente | Tecnología |
|---|---|
| Frontend administrativo | Angular 18 |
| Interfaz | Angular Material |
| Calendario | FullCalendar |
| Backend | Node.js, Express y TypeScript |
| Base de datos | PostgreSQL |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Calendarios externos | Google Calendar |
| Autenticación administrativa | JWT |

Estas tecnologías deben reutilizarse siempre que resulte técnicamente viable.

**No desarrollar otro POS ni reemplazar el backend existente.**

El objetivo es ampliar las capacidades del sistema mediante un nuevo portal móvil para las clientas y nuevos módulos administrativos.

Antes de implementar cualquier modificación, inspeccionar:

- Código fuente del frontend administrativo.
- Código fuente del backend.
- Esquema real de PostgreSQL y migraciones.
- Sistema actual de autenticación y autorización.
- Sistema de citas y validación de conflictos.
- Integración actual con Google Calendar.
- Relaciones entre clientes, ventas y citas.
- Configuración actual de despliegue.

Los nombres de tablas, columnas, rutas y componentes propuestos en este documento son orientativos. Deben adaptarse al código existente después de verificarlo.

No efectuar cambios destructivos en producción.

---

# 2. OBJETIVO GENERAL

Desarrollar un portal de reservas online que permita a las clientas consultar la disponibilidad de las profesionales, solicitar citas y gestionar sus propias reservas.

Las profesionales deberán disponer de herramientas para gestionar sus horarios laborales, descansos, días libres y solicitudes de citas.

El administrador conservará el control de la información histórica y tendrá autorización exclusiva para vincular cuentas digitales con los clientes previamente registrados en el POS.

El sistema debe prevenir reservas duplicadas, proteger los datos personales y evitar que registros fraudulentos contaminen la base administrativa.

---

# 3. ARQUITECTURA PROPUESTA

El sistema tendrá tres interfaces principales.

### A. POS administrativo existente

Mantener el sistema Angular actual e incorporar los módulos necesarios para gestionar:

- Solicitudes de citas.
- Vinculación de cuentas.
- Posibles duplicados.
- Horarios laborales.
- Bloqueos y vacaciones.
- Parámetros del portal.
- Permisos de las profesionales.

### B. Portal de reservas para clientas

Crear una aplicación Angular independiente, diseñada principalmente para dispositivos móviles.

Implementar tecnología PWA para que pueda añadirse a la pantalla de inicio de Android y iPhone.

No depender de Google Play ni de App Store.

### C. Interfaz móvil para profesionales

Aprovechar el sistema administrativo existente.

Desarrollar vistas responsivas para que las profesionales puedan consultar sus agendas y administrar solicitudes y horarios desde sus teléfonos.

No es necesario duplicar todas las funciones administrativas en esta interfaz.

### Arquitectura general

```text
                 CLIENTAS
                    |
              Angular PWA
                    |
                    |
PROFESIONALES ------|------ ADMINISTRADOR
       |            |             |
       |            |             |
    Interfaz        |          POS Angular
     móvil          |             |
       |            |             |
       +------------+-------------+
                    |
               API CENTRAL
                    |
        Node.js + Express + TS
                    |
                PostgreSQL
                    |
             Google Calendar
```

Todas las operaciones importantes deben ejecutarse y validarse en el backend.

El portal no tendrá acceso directo a PostgreSQL.

---

# 4. MODELO DE USUARIOS Y PERMISOS

El sistema contará con tres roles principales.

## 4.1. Administrador

Podrá:

- Gestionar todos los clientes del POS.
- Revisar las cuentas creadas desde el portal.
- Vincular cuentas digitales a clientes históricos.
- Crear registros definitivos.
- Revisar y fusionar posibles duplicados.
- Gestionar profesionales y servicios.
- Configurar horarios y bloqueos.
- Consultar y modificar todas las citas.
- Aceptar y rechazar solicitudes.
- Configurar parámetros generales de reservas.

La vinculación de una cuenta digital con un cliente histórico será una operación exclusivamente administrativa.

## 4.2. Profesional

Podrá:

- Visualizar sus citas.
- Consultar las solicitudes que le correspondan.
- Aceptar o rechazar solicitudes autorizadas.
- Proponer horarios alternativos.
- Configurar su horario de trabajo.
- Registrar descansos.
- Registrar ausencias y vacaciones.
- Bloquear días u horas determinados.

No podrá vincular cuentas con registros históricos ni fusionar clientes, salvo que también tenga el rol administrativo.

Tampoco podrá consultar información financiera o personal que no resulte necesaria para sus funciones.

## 4.3. Clienta

Podrá:

- Registrarse.
- Verificar su cuenta.
- Iniciar sesión.
- Consultar servicios y profesionales.
- Consultar horarios disponibles.
- Enviar solicitudes de citas.
- Consultar el estado de sus solicitudes.
- Aceptar o rechazar horarios alternativos.
- Cancelar sus solicitudes y citas según las políticas del negocio.
- Consultar sus propias citas.

No podrá acceder a información privada de otras clientas, profesionales o del negocio.

---

# 5. SISTEMA DE CUENTAS DIGITALES

Este módulo será independiente de la tabla histórica `clients`.

## 5.1. Registro

El formulario de registro solicitará inicialmente:

- Nombre y apellido.
- Número de teléfono.
- Correo electrónico opcional.
- Credenciales de acceso, según el mecanismo de autenticación seleccionado.

No solicitar obligatoriamente la cédula.

Implementar verificación del teléfono mediante OTP, preferiblemente SMS o WhatsApp, según los costos y servicios disponibles.

Evaluar también la verificación por correo electrónico.

No considerar una cuenta completamente verificada hasta finalizar correctamente el mecanismo de comprobación elegido.

## 5.2. Separación de identidades

Existirán dos entidades distintas:

**Cliente administrativo:** registro almacenado en `clients` que puede contener apodos, información incompleta, citas anteriores y transacciones.

**Cuenta digital:** registro utilizado para autenticarse en el portal.

Crear una tabla de cuentas independiente y una relación explícita entre ambas entidades.

No mezclar automáticamente la información del registro público con la información administrativa.

No conceder acceso al historial antiguo únicamente por coincidencias de nombre, teléfono, correo o cédula.

## 5.3. Registros provisionales

Una cuenta digital nueva no deberá generar inmediatamente un cliente definitivo en el POS.

El backend almacenará sus datos de forma independiente mientras no exista una vinculación administrativa.

La clienta podrá consultar disponibilidad y enviar solicitudes sin necesidad de que el administrador la vincule previamente.

Las solicitudes deberán admitir referencias a cuentas digitales todavía no vinculadas.

**Regla fundamental:** no permitir que este mecanismo genere automáticamente registros definitivos innecesarios en `clients`.

---

# 6. VINCULACIÓN ADMINISTRATIVA DE CUENTAS

Este módulo es uno de los componentes más importantes del proyecto.

La base de datos histórica contiene registros incompletos, nombres abreviados, apodos, referencias familiares y posibles duplicados.

Por tanto, queda prohibida la vinculación automática con registros históricos.

## 6.1. Panel administrativo

Crear el módulo:

**Clientes → Cuentas digitales → Vinculaciones**

Mostrar:

- Cuentas vinculadas.
- Cuentas pendientes.
- Posibles coincidencias.
- Solicitudes de vinculación.
- Historial de operaciones.

Implementar búsqueda por nombre, teléfono, correo y otros identificadores disponibles.

## 6.2. Detección de coincidencias

Cuando una clienta cree su cuenta, el sistema buscará posibles coincidencias en el POS.

Los criterios podrán incluir:

- Nombres normalizados.
- Coincidencias parciales.
- Teléfonos normalizados.
- Correos normalizados.
- Identificadores adicionales, cuando existan.

Los resultados se mostrarán exclusivamente al administrador.

No modificar automáticamente los registros históricos.

No interpretar una coincidencia de nombre o teléfono como prueba suficiente de identidad.

## 6.3. Operaciones administrativas

El administrador dispondrá de tres acciones principales.

**Vincular cuenta existente**

Seleccionará una cuenta digital y el registro administrativo correspondiente.

El sistema deberá solicitar confirmación y registrar quién autorizó la operación.

**Crear nuevo cliente**

Cuando la cuenta corresponda a una persona no registrada, el administrador podrá crear su ficha utilizando los datos disponibles y verificados.

**Mantener pendiente**

Cuando existan dudas, la cuenta permanecerá sin vincular.

La clienta podrá seguir utilizando las funciones permitidas del portal.

## 6.4. Integración con solicitudes de citas

Cuando una cuenta no vinculada solicite una cita, el administrador visualizará una advertencia.

Desde la propia solicitud podrá:

1. Consultar posibles coincidencias.
2. Vincular un cliente existente.
3. Crear un cliente nuevo.
4. Mantener la vinculación pendiente.

La profesional podrá revisar y aprobar operativamente una solicitud sin obtener permisos de administración de clientes.

Si una solicitud aprobada todavía no dispone de un cliente administrativo válido, deberá quedar en estado de incorporación pendiente.

Durante ese proceso, el horario quedará protegido contra reservas incompatibles.

La cita oficial se creará cuando se resuelva correctamente la relación administrativa.

Esta transición deberá completarse de forma segura y notificarse al administrador cuando requiera intervención.

---

# 7. REVISIÓN DE DUPLICADOS HISTÓRICOS

Crear una herramienta administrativa que permita identificar posibles registros duplicados dentro del POS.

Mostrar:

- Datos de ambos registros.
- Citas asociadas.
- Ventas asociadas.
- Información de contacto.
- Cuentas digitales vinculadas.

Permitir que el administrador confirme si dos registros representan a la misma persona.

No fusionar automáticamente.

La consolidación deberá conservar las relaciones con citas, ventas, pagos y demás tablas relacionadas.

Antes de desarrollar esta función, identificar todas las claves foráneas y dependencias reales.

Implementar operaciones transaccionales y auditoría.

No eliminar registros de forma irreversible durante la primera fase del proyecto.

---

# 8. SERVICIOS Y PROFESIONALES

El portal deberá permitir seleccionar los servicios disponibles para reserva online.

No todos los productos del POS necesariamente serán servicios reservables.

Por tanto, distinguir entre productos comerciales y servicios que requieren cita.

Cada servicio reservable deberá disponer de:

- Nombre.
- Descripción.
- Duración.
- Precio público, cuando corresponda.
- Estado.
- Disponibilidad para reservas online.

Los servicios podrán asociarse a determinadas profesionales.

Por ejemplo, una profesional puede realizar manicura y pedicura, pero no tratamientos capilares.

Crear una relación entre profesionales y servicios cuando el modelo actual no contemple esa funcionalidad.

El administrador determinará qué profesionales pueden realizar cada servicio.

Contemplar la posibilidad de configurar duraciones especiales por profesional si el negocio lo requiere.

---

# 9. HORARIOS LABORALES

Las profesionales deberán poder configurar sus horarios habituales.

Crear una estructura para almacenar la disponibilidad semanal.

Debe admitir varios intervalos diarios.

Ejemplo:

```text
LUNES
09:00 - 12:00
14:00 - 18:00

MARTES
09:00 - 18:00

DOMINGO
NO LABORA
```

El administrador podrá modificar estos horarios.

La profesional únicamente podrá modificar los suyos cuando tenga autorización.

Todas las operaciones deben validarse en el backend.

---

# 10. BLOQUEOS, DESCANSOS Y VACACIONES

Implementar un sistema independiente para excepciones del horario habitual.

Cada profesional podrá registrar:

**Día libre:** fecha completa en la que no trabajará.

**Bloqueo por horas:** intervalo específico durante el cual no estará disponible.

**Vacaciones:** periodos prolongados de ausencia.

**Descanso:** intervalos destinados a alimentación u otras actividades.

**Bloqueos recurrentes:** intervalos que se repiten periódicamente, cuando estén configurados.

El sistema deberá impedir que las clientas soliciten citas incompatibles con estos bloqueos.

Si una profesional intenta bloquear un intervalo que contiene citas confirmadas, no se deberán cancelar automáticamente.

El sistema mostrará los conflictos y solicitará una resolución.

El administrador podrá intervenir cuando resulte necesario.

---

# 11. MOTOR CENTRAL DE DISPONIBILIDAD

Desarrollar un único servicio de disponibilidad reutilizable por el portal público y el POS.

No implementar algoritmos independientes que puedan producir resultados contradictorios.

El cálculo deberá considerar:

1. Horario habitual de la profesional.
2. Disponibilidad para el servicio seleccionado.
3. Duración del servicio.
4. Descansos y bloqueos.
5. Vacaciones.
6. Citas confirmadas.
7. Solicitudes que mantienen una reserva temporal válida.
8. Intervalos adicionales de preparación, cuando correspondan.

El backend devolverá únicamente las opciones necesarias para que una clienta solicite una cita.

No enviar nombres, teléfonos, servicios ni información privada de otras clientas.

No publicar los motivos privados de los bloqueos.

Cuando una clienta seleccione una fecha, recibirá los horarios de inicio en los que el servicio completo puede realizarse.

Toda disponibilidad mostrada deberá considerarse provisional hasta que el backend valide nuevamente la operación.

Utilizar la zona horaria `America/Guayaquil` para la presentación de horarios del negocio y almacenar los instantes de manera consistente.

---

# 12. PORTAL DE RESERVAS

Desarrollar una interfaz móvil sencilla, rápida y responsiva.

## Pantalla principal

Mostrar:

- Identidad visual del negocio.
- Botón para reservar.
- Catálogo de servicios.
- Acceso a cuenta.
- Acceso a solicitudes y citas.

## Flujo de reserva

**Paso 1:** seleccionar servicio.

**Paso 2:** seleccionar profesional.

**Paso 3:** seleccionar fecha.

**Paso 4:** visualizar horarios disponibles.

**Paso 5:** seleccionar horario.

**Paso 6:** confirmar los datos de la solicitud.

**Paso 7:** enviar solicitud.

Mostrar claramente que solicitar una cita no significa que esté confirmada.

Las clientas deberán poder consultar sus solicitudes sin necesidad de ponerse en contacto continuamente con el negocio.

---

# 13. GESTIÓN DE SOLICITUDES

Crear un módulo de solicitudes independiente del registro de citas oficiales.

Estados funcionales sugeridos:

- Pendiente.
- Aceptada.
- Rechazada.
- Cancelada.
- Caducada.
- Propuesta de cambio.
- Pendiente de incorporación administrativa.
- Confirmada.

Los estados técnicos deberán diseñarse de manera que no existan transiciones ambiguas.

Registrar todos los cambios relevantes.

La profesional podrá:

- Aceptar.
- Rechazar.
- Proponer otra fecha u hora.

Cuando la profesional proponga una alternativa, la clienta deberá aceptarla antes de continuar.

El sistema tendrá que verificar nuevamente la disponibilidad de ese horario.

---

# 14. CONTROL DE RESERVAS SIMULTÁNEAS

Evitar que varias clientas obtengan confirmaciones incompatibles.

Implementar protección contra condiciones de carrera a nivel de backend y base de datos.

No confiar exclusivamente en la disponibilidad calculada por Angular.

Al aceptar o confirmar una reserva:

1. Iniciar una operación transaccional.
2. Verificar nuevamente la disponibilidad.
3. Bloquear o proteger los recursos necesarios.
4. Comprobar conflictos.
5. Registrar la transición correspondiente.
6. Confirmar la transacción.

Evaluar restricciones de exclusión de intervalos en PostgreSQL y mecanismos transaccionales apropiados para el modelo existente.

No permitir que las opciones actuales del POS para forzar conflictos comprometan las reservas públicas.

Las excepciones administrativas deberán ser explícitas y auditables.

---

# 15. POLÍTICA DE SOLICITUDES PENDIENTES

No permitir un número ilimitado de solicitudes pendientes.

Implementar límites configurables por cuenta.

Desarrollar un sistema de reservas temporales cuando sea necesario.

Evitar mantener horarios bloqueados indefinidamente por solicitudes abandonadas.

Los tiempos de caducidad deberán poder configurarse por el administrador.

No utilizar una caducidad demasiado corta si las profesionales no pueden revisar solicitudes constantemente.

Distinguir entre:

- Una solicitud recibida.
- Una reserva temporal.
- Una solicitud aceptada operativamente.
- Una cita oficialmente confirmada.

Las solicitudes caducadas deberán liberar automáticamente cualquier retención temporal.

Las solicitudes que requieran vinculación administrativa deberán tener un tratamiento específico para impedir conflictos.

---

# 16. INTEGRACIÓN CON GOOGLE CALENDAR

Reutilizar la integración ya existente.

No crear una segunda implementación independiente de sincronización.

Las solicitudes pendientes no deberán generar citas oficiales en Google Calendar.

Cuando se complete correctamente la confirmación administrativa y operativa, deberá generarse la cita oficial mediante los mecanismos existentes.

Posteriormente, se ejecutará la sincronización correspondiente.

El sistema deberá manejar:

- Fallos temporales de Google.
- Reintentos.
- Actualizaciones de citas.
- Cancelaciones.
- Prevención de eventos duplicados.

La base de datos será la fuente principal de información.

Un fallo de Google Calendar no deberá provocar la pérdida de una reserva válida.

---

# 17. NOTIFICACIONES

Implementar el módulo de notificaciones de forma desacoplada.

Preparar soporte para los siguientes eventos:

- Solicitud recibida.
- Solicitud aceptada.
- Solicitud rechazada.
- Propuesta de cambio.
- Cita confirmada.
- Cita cancelada.
- Recordatorio de cita.

Priorizar inicialmente las notificaciones dentro del portal y del POS.

Evaluar posteriormente correo electrónico y Web Push.

Las notificaciones mediante WhatsApp deberán considerarse una integración posterior debido a sus requisitos operativos y posibles costos.

No retrasar el lanzamiento inicial por depender de un proveedor externo de mensajería.

---

# 18. SEGURIDAD Y PROTECCIÓN DE LA BASE DE DATOS

El portal será público, pero la API deberá aplicar mecanismos rigurosos de seguridad.

Implementar:

- Verificación de cuentas.
- Protección contra automatizaciones.
- Rate limiting.
- Validación de datos.
- Control de permisos por rol.
- Protección de rutas.
- Registros de auditoría.
- Limitación de solicitudes pendientes.

Evaluar Cloudflare Turnstile para dificultar registros automatizados.

Implementar los controles de seguridad en el backend.

No permitir que el frontend envíe identificadores arbitrarios que permitan modificar registros ajenos.

Aplicar autorizaciones a nivel de recurso.

No exponer información histórica de una cuenta hasta que su vinculación haya sido autorizada.

Evitar que los mensajes de registro y recuperación permitan averiguar qué personas están registradas.

No almacenar códigos OTP en texto plano.

Establecer límites de intentos, caducidad y mecanismos seguros de recuperación.

Implementar políticas de conservación y eliminación de información provisional.

---

# 19. BASE DE DATOS

Conservar las tablas actuales.

Incorporar únicamente las estructuras necesarias después de verificar el esquema real.

Tablas conceptuales sugeridas:

| Tabla | Responsabilidad |
|---|---|
| `client_accounts` | Identidades digitales |
| `client_account_links` | Vinculación administrativa |
| `client_verifications` | Verificaciones |
| `client_link_reviews` | Revisiones de identidad |
| `employee_working_hours` | Horarios habituales |
| `employee_time_blocks` | Ausencias y bloqueos |
| `employee_services` | Servicios por profesional |
| `appointment_requests` | Solicitudes de citas |
| `appointment_request_events` | Historial de solicitudes |
| `notifications` | Notificaciones |
| `audit_logs` | Auditoría |

No duplicar tablas cuando la estructura existente ya resuelva adecuadamente un requisito.

Crear migraciones reversibles siempre que sea posible.

Realizar copias de seguridad y comprobar las restricciones existentes antes de modificar producción.

---

# 20. DESARROLLO POR FASES

## FASE 1 — Auditoría técnica

Analizar el código y la base de datos existente.

Entregables:

- Inventario de componentes reutilizables.
- Esquema real de PostgreSQL.
- Relaciones entre tablas.
- Funcionamiento actual de Google Calendar.
- Sistema actual de usuarios y permisos.
- Riesgos identificados.

No modificar producción.

## FASE 2 — Diseño definitivo

Diseñar:

- Migraciones SQL.
- Endpoints REST.
- Autorización por roles.
- Estados de solicitudes.
- Motor de disponibilidad.
- Sistema de vinculación.
- Interfaces principales.

Validar las decisiones antes de implementar modificaciones estructurales.

## FASE 3 — Identidad y vinculación

Desarrollar:

- Registro digital.
- Autenticación.
- Verificación.
- Protección contra registros fraudulentos.
- Detección de coincidencias.
- Vinculación administrativa.
- Auditoría.

## FASE 4 — Horarios y disponibilidad

Desarrollar:

- Horarios laborales.
- Bloqueos.
- Descansos.
- Vacaciones.
- Asociación de servicios.
- Motor central de disponibilidad.

## FASE 5 — Portal público

Desarrollar:

- Aplicación Angular PWA.
- Catálogo de servicios.
- Selección de profesional.
- Calendario.
- Solicitud de citas.
- Panel personal.

## FASE 6 — Integración administrativa

Desarrollar:

- Bandeja de solicitudes.
- Vinculación durante la gestión de citas.
- Aprobaciones.
- Rechazos.
- Propuestas alternativas.
- Confirmación oficial.

## FASE 7 — Integración y seguridad

Integrar:

- Google Calendar.
- Notificaciones.
- Control de solicitudes simultáneas.
- Rate limiting.
- Verificación de permisos.
- Auditoría.

## FASE 8 — Pruebas y despliegue

Realizar pruebas funcionales, de seguridad y de concurrencia.

Comprobar el funcionamiento en Android, iPhone y escritorio.

Verificar que las funcionalidades existentes del POS continúen funcionando correctamente.

Preparar el despliegue a producción.

---

# 21. CRITERIOS DE ACEPTACIÓN

El proyecto se considerará funcional cuando se cumplan, como mínimo, las siguientes condiciones:

1. Una clienta puede registrarse sin generar automáticamente una ficha definitiva en el POS.
2. El sistema verifica su medio de contacto.
3. El administrador puede vincular cuentas con registros existentes.
4. Las coincidencias no generan vinculaciones automáticas.
5. La clienta únicamente puede consultar su información autorizada.
6. El portal muestra los horarios disponibles.
7. Las clientas no reciben información privada de otras reservas.
8. Las profesionales pueden modificar sus horarios.
9. Los bloqueos afectan inmediatamente la disponibilidad.
10. Las solicitudes pueden aceptarse, rechazarse o modificarse mediante propuestas.
11. El sistema no permite confirmar reservas incompatibles accidentalmente.
12. Las solicitudes pendientes no generan directamente eventos definitivos en Google Calendar.
13. Las citas oficiales se sincronizan con el mecanismo existente.
14. Los registros fraudulentos están sujetos a mecanismos de protección y limitación.
15. El sistema funciona correctamente como PWA en los dispositivos compatibles.
16. El POS actual conserva sus funcionalidades.
17. Las operaciones administrativas sensibles quedan auditadas.

---

# 22. INSTRUCCIONES FINALES PARA EL AGENTE

No comenzar desarrollando interfaces sin comprobar primero la arquitectura existente.

Priorizar la integridad de la base de datos, la privacidad de las clientas y la reutilización del código actual.

Mantener separados los conceptos de cuenta digital, cliente administrativo, solicitud, reserva temporal y cita confirmada.

No automatizar la vinculación de cuentas históricas.

No modificar registros históricos basándose únicamente en coincidencias de información.

Utilizar migraciones controladas y evitar cambios destructivos.

Documentar los endpoints, las reglas de autorización y las decisiones arquitectónicas.

Desarrollar el proyecto de manera incremental, comenzando por la auditoría técnica y continuando con las fases establecidas.

**El resultado esperado es un sistema de reservas que funcione como extensión del POS actual, no como una aplicación aislada que termine duplicando datos y procesos.**