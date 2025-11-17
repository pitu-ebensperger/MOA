# Proyecto Marketplace

### Usuarios para frontend testing:
- **admin@moa.cl** (contraseña: admin o demo o 123456)
- **demo@moa.cl** (contraseña: demo o admin o 123456) 
- **cliente@mail.com** (contraseña: demo o admin o 123456)
 
### Tarjetas de prueba Webpay (integración)
Usa estas tarjetas ficticias mientras trabajas con el ambiente de integración. No requieren fecha de expiración válida: puedes ingresar cualquier combinación razonable.

| Tipo | Tarjeta | CVV | Resultado esperado |
| --- | --- | --- | --- |
| VISA | 4051 8856 0044 6623 | 123 | Aprobada |
| AMEX | 3700 0000 0002 032 | 1234 | Aprobada |
| MASTERCARD | 5186 0595 5959 0568 | 123 | Rechazada |
| Redcompra | 4051 8842 3993 7763 | 123 | Aprobada (si se permite débito) |
| Redcompra | 4511 3466 6003 7060 | 123 | Aprobada (si se permite débito) |
| Redcompra | 5186 0085 4123 3829 | 123 | Rechazada (si se permite débito) |
| Prepago VISA | 4051 8860 0005 6590 | 123 | Aprobada |
| Prepago MASTERCARD | 5186 1741 1062 9480 | 123 | Rechazada |

> Los mocks están habilitados por defecto en `frontend/.env`  
> Para usar con backend real, cambiar `VITE_USE_MOCKS=false`


## Estructura del repositorio

_Cada carpeta gestiona su propio node_modules locales, instalar dependencias antes de ejecutar_
**`frontend/`**
Instalar: `npm i -w frontend paquete`
Ejecutar: `npm run dev` | `npm run preview` | `npm run test` | `npm run lint`

**`backend/`**
Instalar: `npm i -w backend paquete`
Ejecutar: `npm run -w backend dev`

- npm run seed:users --workspace backend (asegura la cuenta `admin@moa.cl/admin123`)
- npm run seed:categories --workspace backend (correr para agregar categorias iniciales)
  -npm run seed:products --workspace backend (correr para agregar productos iniciales)

### Stripe (pasarela de pago)

- Define las variables de entorno `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` para habilitar la pasarela de Stripe en modo sandbox o producción.
- La API expone el endpoint `/webhooks/stripe`, que Stripe usará para enviar confirmaciones asincrónicas.
- Puedes usar las credenciales de prueba de Stripe y los números de tarjeta `4242 4242 4242 4242` para simular cobros sin mover dinero real; recuerda cambiar a claves reales para producción.

**`docs/`**

- [Estructura proyecto y Progreso](./docs/STATUS.md)
- [Listado de dependecias](./docs/DEPENDENCIAS.md)

### Otros

- [Tailwind_Cheatsheet] (https://www.creative-tim.com/twcomponents/cheatsheet/)

---

## Convenciones

### Github Flow

**Ramas/Branches**

- feature/ _(desarrollo de nuevas funcionalidades, ej. feature/add-user-authentication)_
- fix/ _(correción errores, ej. bugfix/issue-123-login-error)_
- chore/ _(tareas mantenimiento o administración, ej. chore/update-dependencies)_
- refactor/ _(restructuración código, ej. refactor/sist-modulos)_

**Organización Proyecto**

- Dejar en componentes si es un elemento genérico o si aparece en 2+ páginas.

---

## Requerimientos

### Hito 1: Diseño y Prototipo

1. Diseñar un boceto de las vista del proyecto.
2. Definir la navegación entre las vistas marcando las públicas y las privadas.
3. Enlistar las dependencias a utilizar en el proyecto.
4. Diseñar las tablas de la base de datos y sus relaciones.
5. Diseñar el contrato de datos de la API REST.

### Hito 2: Desarrollo Frontend\*\*

1. Crear un nuevo proyecto usando npx e instalar las dependencias.\*\*
2. Utilizar React Router para la navegación entre rutas.\*\*
3. Reutilizar componentes haciendo uso del paso de props y renderización dinámica.\*\*
4. Hacer uso de los hooks para un desarrollo ágil y reactivo.\*\*
5. Utilizar Context para el manejo del estado global.\*\*

### Hito 3: Desarrollo Backend

1. Crear un nuevo nuevo de npm e instalar todas las dependencias necesarias.
2. Utilizar el paquete pg para gestionar la comunicación con la base de datos PostgreSQL.
3. Implementar la autenticación y autorización de usuarios con JWT
4. Usar el paquete CORS para permitir las consultas de orígenes cruzados
5. Utilizar middlewares para validar las credenciales o token en cabeceras en las rutas que aplique
6. Realizar test de por lo menos 4 rutas de la API REST comprobando los códigos de
   estados de diferentes escenarios

### Hito 4: Integración y Despliegue

1. Realizar el deploy de la aplicación cliente.
2. Realizar el deploy de la aplicación backend.
3. Realizar el deploy de la base de datos.
4. Integrar la aplicación cliente con la aplicación backend en producción.

### Hito 5: Presentación del proyecto

1. Presentación sincrónica del proyecto (GRUPAL)
   - Cada estudiante deberá exponer sus proyectos mostrando el uso de todas sus funcionalidades como un ejemplo de experiencia de usuario.
   - Adicionalmente, podrán mencionar cuáles fueron sus momentos más destacados durante el desarrollo y que fue lo más difícil de realizar y cómo lo resolvieron
   - Tiempo de exposición: Máximo 10 minutos, posteriormente se reservan 5 minutos para
     preguntas y apreciaciones de los espectadores. (Dado que la duración de las sesiones es de 2 horas, los grupos serán llamados a presentar su proyecto a discreción del docente o tutor).
   - Cada estudiante debe subir la presentación de su grupo, ya sea en formato
     pdf, zip o algún link que contenga la presentación, esta debe subirse en la
     sesión de la tutoría, específicamente en el documento con nombre “Hito 5 -
     Presentación del proyecto”.

2. Grabación asincrónica (video proyecto) (INDIVIDUAL) |
   - Graba una presentación de entre 3 y 5 minutos, de forma individual, respondiendo las siguientes preguntas:
     (a) Qué problemática fue detectada o te fue planteada para el desarrollo del proyecto? Para responder, considera qué necesidades existen y quién las tiene.
     (b) ¿Cómo tu proyecto satisface esa problemática o necesidad? Para responder, describe tu aplicación y señala cómo lo que realizaste logra satisfacer la necesidad detectada.
     (c) ¿Qué conocimientos y habilidades desarrolladas durante la carrera fueron claves para realizar este proyecto? Para responder, identifica en los módulos anteriores aquellos aspectos técnicos y prácticos que aplicaste para el desarrollo de tu aplicación.
   - En la misma presentación, adicionalmente, reflexiona en torno a las siguientes preguntas:
     (a) ¿Qué dificultades tuviste para desarrollar la aplicación y cómo lo resolviste? Para responder, recuerda aquellos tropiezos y frustraciones, piensa qué estrategias o apoyos te permitieron salir adelante.
     (b) ¿Qué fue lo que más disfrutaste de desarrollar tu proyecto? Ya sea del proceso, del resultado o de aquello que te haya entregado mayor satisfacción.
     (c) ¿De qué manera crees que la metodología de aprendizaje fue un aporte para el resultado obtenido? Para responder, mira hacia atrás y reflexiona sobre tu aprendizaje, la metodología de estudio, el trabajo colaborativo, entre otras cosas.
   - Cada estudiante debe subir su propio video, esta debe subirse en la sesión de la tutoría, específicamente en el documento con nombre “Video Proyecto”.
