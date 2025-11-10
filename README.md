# Proyecto Marketplace

## Estructura del repositorio
*Cada carpeta gestiona su propio node_modules locales, instalar dependencias antes de ejecutar*

**`frontend/`**
    Instalar:   `npm i -w frontend paquete`
    Ejecutar:   `npm run dev` | `npm run preview` | `npm run test` | `npm run lint`

**`backend/`**
    Instalar:   `npm i -w backend paquete`
    Ejecutar:   `npm run -w backend dev`

**`docs/`**
- [Estructura proyecto y Progreso](./docs/STATUS.md)
- [Listado de dependecias](./docs/DEPENDENCIAS.md)


### Otros
- [Tailwind_Cheatsheet] (https://www.creative-tim.com/twcomponents/cheatsheet/)


--------------------------------------------------------------------------------------------------

## Convenciones

### Github Flow

**Ramas/Branches**
- feature/ *(desarrollo de nuevas funcionalidades, ej. feature/add-user-authentication)*
- fix/ *(correción errores, ej. bugfix/issue-123-login-error)*
- chore/ *(tareas mantenimiento o administración, ej. chore/update-dependencies)*
- refactor/ *(restructuración código, ej. refactor/sist-modulos)*

**Organización Proyecto**
- Dejar en componentes si es un elemento genérico o si aparece en 2+ páginas.


--------------------------------------------------------------------------------------------------

## Requerimientos

### Hito 1: Diseño y Prototipo
1. Diseñar un boceto de las vista del proyecto.
2. Definir la navegación entre las vistas marcando las públicas y las privadas.
3. Enlistar las dependencias a utilizar en el proyecto.
4. Diseñar las tablas de la base de datos y sus relaciones.
5. Diseñar el contrato de datos de la API REST.

-> **### Hito 2: Desarrollo Frontend**
**1. Crear un nuevo proyecto usando npx e instalar las dependencias.**
**2. Utilizar React Router para la navegación entre rutas.**
**3. Reutilizar componentes haciendo uso del paso de props y renderización dinámica.**
**4. Hacer uso de los hooks para un desarrollo ágil y reactivo.**
**5. Utilizar Context para el manejo del estado global.**

### Hito 3: Desarrollo Backend
1. Crear un nuevo nuevo de npm e instalar todas las dependencias necesarias.
2. Utilizar el paquete pg para gestionar la comunicación con la base de datos PostgreSQL.
3. Implementar la ....

### Hito 4: Integración y Despliegue
1. Realizar el deploy de la aplicación cliente.
2. Realizar el deploy de la aplicación backend.
3. Realizar el deploy de la base de datos.
4. Integrar la aplicación cliente con la aplicación backend en producción.

--------------------------------------------------------------------------------------------------

## Tablas

![Tablas](https://github.com/user-attachments/assets/b2f58314-b984-429a-bdea-96cca7ab55a1)

