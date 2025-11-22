# Manual de Administrador - MOA E-commerce

Guía completa para administrar la plataforma MOA desde el panel administrativo.

## 📋 Tabla de Contenidos

1. [Acceso al Panel](#acceso-al-panel)
2. [Dashboard Principal](#dashboard-principal)
3. [Gestión de Productos](#gestión-de-productos)
4. [Gestión de Categorías](#gestión-de-categorías)
5. [Gestión de Órdenes](#gestión-de-órdenes)
6. [Gestión de Clientes](#gestión-de-clientes)
7. [Configuración de la Tienda](#configuración-de-la-tienda)
8. [Reportes y Analíticas](#reportes-y-analíticas)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🔐 Acceso al Panel

### Credenciales de Administrador

**URL**: `http://localhost:5173/admin` (desarrollo) o `https://tu-dominio.cl/admin` (producción)

**Credenciales por defecto** (desarrollo):
```
Email: admin@moa.cl
Password: admin
```

⚠️ **IMPORTANTE**: Cambia la contraseña en producción inmediatamente después del primer login.

### Primer Login

1. Navega a la URL del admin
2. Ingresa credenciales
3. El sistema te redirigirá al Dashboard
4. Tu sesión durará **7 días** (configurable en `.env` con `JWT_ADMIN_EXPIRES_IN`)

### Recuperar Contraseña

Si olvidas tu contraseña:
1. Usa el enlace "¿Olvidaste tu contraseña?" en `/admin/login`
2. Recibirás un email con un link de reseteo (válido por 1 hora)
3. Crea una nueva contraseña segura

**Requisitos de contraseña**:
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial

---

## 📊 Dashboard Principal

### Vista General

El dashboard muestra métricas clave en tiempo real:

#### Tarjetas de Métricas (Top)
- **Ventas Totales**: Suma de todas las órdenes confirmadas
- **Órdenes Activas**: Órdenes en proceso (pendientes, enviadas)
- **Productos**: Total de productos activos en catálogo
- **Clientes**: Total de usuarios registrados

#### Gráficos
- **Ventas por Mes**: Gráfico de barras con ingresos mensuales (últimos 12 meses)
- **Productos Más Vendidos**: Top 10 productos por cantidad vendida
- **Distribución por Categoría**: Gráfico de torta con % de ventas por categoría

#### Alertas Importantes
- 🔴 **Stock Bajo**: Productos con stock < 5 unidades
- ⚠️ **Órdenes Pendientes**: Órdenes sin procesar > 24 horas
- 📦 **Envíos Atrasados**: Órdenes con fecha de envío vencida

### Navegación

**Menú lateral izquierdo**:
```
📊 Dashboard
📦 Productos
   ├─ Lista de Productos
   └─ Categorías
📋 Órdenes
👥 Clientes
⚙️ Configuración
📈 Reportes
🚪 Cerrar Sesión
```

---

## 📦 Gestión de Productos

### Lista de Productos

**Ruta**: `/admin/productos`

#### Tabla de Productos

Columnas visibles:
- **Imagen**: Miniatura del producto
- **Nombre**: Nombre del producto
- **SKU**: Código único
- **Categoría**: Categoría asignada
- **Precio**: Precio en CLP
- **Stock**: Cantidad disponible
- **Estado**: Activo/Inactivo
- **Acciones**: Editar, Eliminar, Ver

#### Barra de Herramientas

**Búsqueda**:
```
🔍 Buscar por nombre, SKU o categoría...
```

**Filtros**:
- **Categoría**: Filtrar por categoría específica
- **Estado**: Activo / Inactivo / Todos
- **Stock**: Todos / Stock Bajo (<5) / Sin Stock (0)

**Ordenamiento**:
- Por Nombre (A-Z, Z-A)
- Por Precio (Menor a Mayor, Mayor a Menor)
- Por Stock (Menor a Mayor, Mayor a Menor)
- Por Fecha de Creación (Más Reciente, Más Antiguo)

**Acciones Masivas**:
- Exportar CSV: Descarga lista de productos
- Importar CSV: Carga masiva de productos (ver formato más abajo)

### Crear Nuevo Producto

**Botón**: `+ Nuevo Producto` (esquina superior derecha)

#### Formulario de Creación

**Información Básica**:
```
Nombre del Producto*: [Mesa de Comedor Moderna]
SKU*: [MESA-001] (único, auto-generado si se deja vacío)
Descripción*: [Descripción detallada del producto...]
Categoría*: [Dropdown: Mesas]
```

**Precios e Inventario**:
```
Precio (CLP)*: [150000]
Stock Inicial*: [10]
Estado: [✓] Activo
Destacado: [ ] Producto destacado en home
```

**Dimensiones** (opcional):
```
Ancho (cm): [120]
Alto (cm): [75]
Profundidad (cm): [80]
Peso (kg): [25.5]
```

**Imágenes**:
```
[Subir Imagen Principal*] (máx 5MB, JPG/PNG/WEBP)
[Subir Imágenes Adicionales] (hasta 5 imágenes)
```

**Metadatos SEO** (opcional):
```
Meta Title: [Mesa de Comedor Moderna - MOA]
Meta Description: [Mesa de comedor estilo moderno...]
```

**Botones**:
- `Guardar` (crea producto activo)
- `Guardar como Borrador` (crea producto inactivo)
- `Cancelar` (descarta cambios)

#### Validaciones Automáticas

- ✅ Nombre: 3-200 caracteres
- ✅ SKU: Único en base de datos
- ✅ Precio: Mayor a 0
- ✅ Stock: Número entero >= 0
- ✅ Categoría: Debe existir en sistema
- ✅ Imagen principal: Obligatoria

### Editar Producto

**Opción 1**: Click en ícono ✏️ en tabla
**Opción 2**: Click en fila → botón "Editar"

Se abre el mismo formulario con datos pre-cargados. Cambios se guardan inmediatamente.

### Eliminar Producto

**Botón**: 🗑️ en acciones

**Confirmación**:
```
¿Estás seguro de eliminar "Mesa de Comedor"?

Esta acción es permanente y no se puede deshacer.
El producto quedará inactivo en lugar de eliminarse físicamente.

[Cancelar] [Eliminar]
```

⚠️ **Importante**: Los productos con órdenes asociadas NO se eliminan, solo se marcan como inactivos.

### Importación Masiva (CSV)

**Formato CSV esperado**:
```csv
nombre,sku,descripcion,categoria_slug,precio,stock,activo
Mesa Moderna,MESA-001,Mesa de comedor estilo moderno,mesas,150000,10,true
Silla Ejecutiva,SILLA-002,Silla ergonómica para oficina,sillas,85000,25,true
```

**Pasos**:
1. Descarga plantilla CSV desde "Exportar Plantilla"
2. Completa datos (Excel, Google Sheets, etc.)
3. Click "Importar CSV"
4. Selecciona archivo
5. Verifica preview de datos
6. Click "Confirmar Importación"

**Errores comunes**:
- ❌ SKU duplicado → Se omite la fila
- ❌ Categoría inexistente → Error, debes crearla primero
- ❌ Precio inválido → Se omite la fila

Verás un reporte de éxito/errores al finalizar.

---

## 🏷️ Gestión de Categorías

### Lista de Categorías

**Ruta**: `/admin/categorias`

#### Tabla de Categorías

Columnas:
- **Nombre**: Nombre de la categoría
- **Slug**: URL-friendly (ej: `mesas-de-comedor`)
- **Descripción**: Breve descripción
- **Productos**: Cantidad de productos asignados
- **Orden**: Orden de visualización (drag & drop)
- **Estado**: Activa/Inactiva
- **Acciones**: Editar, Eliminar

### Crear Categoría

**Formulario**:
```
Nombre*: [Mesas de Comedor]
Slug: [mesas-de-comedor] (auto-generado)
Descripción: [Mesas elegantes para tu comedor]
Orden: [1] (menor = aparece primero)
Estado: [✓] Activa
```

**Validaciones**:
- Slug único
- Nombre 3-100 caracteres
- Orden: número entero >= 0

### Reordenar Categorías

**Modo Drag & Drop**:
1. Click en "Modo Reordenamiento"
2. Arrastra categorías con el ícono ⋮⋮
3. Click "Guardar Orden"

El orden afecta la visualización en el menú del frontend.

### Eliminar Categoría

⚠️ **No puedes eliminar categorías con productos asignados**. Primero reasigna los productos a otra categoría.

---

## 📋 Gestión de Órdenes

### Lista de Órdenes

**Ruta**: `/admin/ordenes`

#### Tabla de Órdenes

Columnas:
- **N° Orden**: Código único (ej: `ORD-2024-001234`)
- **Cliente**: Nombre + email
- **Fecha**: Fecha de creación
- **Total**: Monto total en CLP
- **Estado Orden**: Badge con color
  - 🟡 Pendiente (amarillo)
  - 🟢 Confirmada (verde)
  - 🔵 Enviada (azul)
  - ✅ Completada (verde oscuro)
  - 🔴 Cancelada (rojo)
- **Estado Pago**: Pendiente / Pagado / Rechazado
- **Estado Envío**: Pendiente / En Preparación / Enviado / Entregado
- **Acciones**: Ver Detalle, Editar Estados, Imprimir

#### Filtros

**Búsqueda**:
```
🔍 Buscar por N° orden, cliente, email...
```

**Filtros Avanzados**:
- **Estado Orden**: Todos / Pendiente / Confirmada / Enviada / Completada / Cancelada
- **Estado Pago**: Todos / Pendiente / Pagado / Rechazado
- **Estado Envío**: Todos / Pendiente / En Preparación / Enviado / Entregado
- **Fecha**: Hoy / Última Semana / Último Mes / Personalizado (date picker)
- **Monto**: Menor a / Mayor a / Entre (rangos)

### Ver Detalle de Orden

**Click en orden** abre modal o página con:

#### Información General
```
N° Orden: ORD-2024-001234
Cliente: Juan Pérez (juan@example.com)
Fecha: 15 Nov 2024, 14:35
Total: $325.000 CLP
```

#### Estados Actuales
```
Estado Orden: ● Confirmada
Estado Pago: ● Pagado
Estado Envío: ● Enviado
```

#### Items de la Orden

Tabla con:
- Imagen del producto
- Nombre
- Cantidad
- Precio Unitario
- Subtotal

```
[Img] Mesa Moderna        x2    $150.000    $300.000
[Img] Lámpara de Mesa     x1    $25.000     $25.000
                                  Subtotal:  $325.000
                                  Envío:     Gratis
                                  TOTAL:     $325.000
```

#### Dirección de Envío
```
Juan Pérez
Av. Libertador 1234, Depto 56
Providencia, Santiago
Región Metropolitana
Teléfono: +56912345678
```

#### Información de Pago
```
Método: Transferencia Bancaria
Estado: Pagado
Fecha de Pago: 15 Nov 2024, 14:40
```

#### Información de Envío
```
Método: Envío a Domicilio
Estado: Enviado
Tracking: CHI1234567890
Fecha Estimada: 20 Nov 2024
```

#### Notas Internas (Solo Admin)
```
[Agregar Nota]
💬 Cliente solicitó llamar antes de entregar - Admin (15 Nov, 15:00)
💬 Producto preparado para despacho - Admin (16 Nov, 09:00)
```

#### Timeline de la Orden
```
15 Nov 14:35  ● Orden creada
15 Nov 14:40  ● Pago confirmado
16 Nov 09:00  ● Enviado (Tracking: CHI123...)
```

### Actualizar Estados de Orden

**Botón**: `Actualizar Estados` en detalle de orden

#### Formulario de Actualización
```
Estado Orden: [Dropdown]
  - Pendiente
  - Confirmada
  - Enviada
  - Completada
  - Cancelada

Estado Pago: [Dropdown]
  - Pendiente
  - Pagado
  - Rechazado

Estado Envío: [Dropdown]
  - Pendiente
  - En Preparación
  - Enviado
  - Entregado
  - Retirado en Tienda

Tracking: [CHI1234567890] (opcional)

Nota Interna: [Cliente pidió cambiar dirección...]
```

**Validaciones**:
- ⚠️ No puedes marcar envío como "Enviado" si pago está "Pendiente"
- ⚠️ No puedes completar orden sin pago confirmado
- ✅ Tracking es obligatorio si estado envío = "Enviado"

**Notificaciones Automáticas**:
- ✉️ **Pago Confirmado** → Email al cliente
- ✉️ **Enviado** → Email con tracking al cliente
- ✉️ **Completada** → Email de agradecimiento + solicitud de review

### Imprimir Orden

**Botón**: `🖨️ Imprimir`

Genera PDF con:
- Información completa de la orden
- Items y totales
- Dirección de envío
- Código de barras con N° orden

Útil para preparación de despacho.

### Cancelar Orden

**Botón**: `Cancelar Orden` (requiere confirmación)

**Proceso**:
1. Confirmar cancelación
2. Sistema devuelve stock automáticamente
3. Si pago confirmado, se marca para reembolso
4. Cliente recibe email de notificación

⚠️ Solo puedes cancelar órdenes con estado "Pendiente" o "Confirmada".

---

## 👥 Gestión de Clientes

### Lista de Clientes

**Ruta**: `/admin/clientes`

#### Tabla de Clientes

Columnas:
- **Nombre**: Nombre completo
- **Email**: Email de registro
- **Teléfono**: Número de contacto
- **Fecha Registro**: Fecha de creación de cuenta
- **Total Órdenes**: Cantidad de órdenes realizadas
- **Total Gastado**: Suma de órdenes confirmadas
- **Estado**: Activo / Bloqueado
- **Acciones**: Ver Perfil, Ver Órdenes, Editar, Bloquear

#### Filtros
```
🔍 Buscar por nombre, email, teléfono...

Ordenar por:
- Más Reciente
- Más Antiguo
- Mayor Gasto
- Más Órdenes

Estado: Todos / Activos / Bloqueados
```

### Ver Perfil de Cliente

**Click en cliente** abre modal con:

#### Información Personal
```
Nombre: Juan Pérez
Email: juan@example.com
Teléfono: +56912345678
RUT: 12.345.678-9
Fecha Registro: 10 Enero 2024
```

#### Estadísticas
```
Total Órdenes: 12
Total Gastado: $1.850.000
Última Compra: 15 Nov 2024
Ticket Promedio: $154.167
```

#### Direcciones Registradas
```
📍 Av. Libertador 1234, Depto 56 (Principal)
   Providencia, Santiago - RM
   
📍 Camino El Alba 456
   Las Condes, Santiago - RM
```

#### Últimas Órdenes (5 más recientes)
```
ORD-2024-001234  15 Nov  $325.000  Enviada
ORD-2024-001100  05 Oct  $180.000  Completada
...
```

### Bloquear/Desbloquear Cliente

**Motivos para bloquear**:
- Actividad fraudulenta
- Devoluciones excesivas
- Comportamiento inapropiado

**Proceso**:
1. Click en "Bloquear Cliente"
2. Ingresa motivo (obligatorio)
3. Confirmar

Cliente bloqueado NO puede:
- Realizar nuevas órdenes
- Agregar productos al carrito
- Login (verá mensaje "Cuenta suspendida")

**Desbloquear**: Click en "Desbloquear" → Confirmar

---

## ⚙️ Configuración de la Tienda

### Configuración General

**Ruta**: `/admin/configuracion`

#### Información de la Tienda
```
Nombre de la Tienda*: [MOA - Muebles de Alta Calidad]
Email de Contacto*: [contacto@moa.cl]
Teléfono: [+56912345678]
Dirección Física: [Av. Providencia 1234, Santiago]
```

#### Configuración de Envíos
```
Envío Gratis desde: [$50000] (en CLP, 0 para desactivar)
Costo Envío Estándar: [$5000] (en CLP)
Costo Envío Express: [$10000]
Tiempo Estimado Envío Estándar: [5-7] días hábiles
Tiempo Estimado Envío Express: [1-2] días hábiles

Regiones con Envío:
  ☑ Región Metropolitana
  ☑ Valparaíso
  ☑ O'Higgins
  ☐ Bío-Bío (temporal fuera de cobertura)
  ...
```

#### Métodos de Pago
```
Métodos Activos:
  ☑ Transferencia Bancaria
  ☑ WebPay (requiere credenciales)
  ☐ MercadoPago (no configurado)

Configuración WebPay:
  Modo: [ ] Producción  [✓] Sandbox
  Commerce Code: [597012345678]
  API Key: [••••••••••••••••]
  [Probar Conexión]
```

#### Impuestos
```
IVA (%): [19]
Incluir IVA en precios mostrados: [✓] Sí / [ ] No
```

#### Notificaciones por Email
```
Enviar email al cliente en:
  ☑ Orden creada
  ☑ Pago confirmado
  ☑ Orden enviada
  ☑ Orden completada
  ☑ Orden cancelada

Enviar email al admin en:
  ☑ Nueva orden recibida
  ☑ Stock bajo (<5 unidades)
  ☐ Nuevo cliente registrado
```

#### Mantenimiento
```
Modo Mantenimiento: [ ] Activado
Mensaje para usuarios: [Estamos actualizando la tienda...]
```

**Botón**: `💾 Guardar Configuración`

### Usuarios Administradores

**Ruta**: `/admin/configuracion/admins`

#### Lista de Administradores
```
Nombre          Email               Rol       Fecha Creación
Admin Principal admin@moa.cl        SuperAdmin 01 Enero 2024
María López     maria@moa.cl        Admin      15 Marzo 2024
```

#### Crear Nuevo Admin
```
Nombre*: [Carlos Martínez]
Email*: [carlos@moa.cl]
Password*: [••••••••] (mínimo 8 caracteres)
Rol: [Admin] (Admin / SuperAdmin)

Permisos:
  ☑ Ver órdenes
  ☑ Editar órdenes
  ☑ Ver productos
  ☑ Crear/Editar productos
  ☑ Eliminar productos
  ☑ Ver clientes
  ☐ Bloquear clientes
  ☐ Configuración de tienda (solo SuperAdmin)
```

---

## 📈 Reportes y Analíticas

### Ventas

**Ruta**: `/admin/reportes/ventas`

#### Gráficos Disponibles
1. **Ventas por Día/Semana/Mes**: Line chart con ingresos
2. **Comparación YoY**: Compara con mismo período año anterior
3. **Productos Más Vendidos**: Bar chart top 20
4. **Categorías Más Vendidas**: Pie chart

#### Métricas Clave
```
Período: [Último Mes ▼]

Total Ventas: $5.850.000 CLP  ↑ +15% vs mes anterior
Órdenes: 47                   ↑ +8%
Ticket Promedio: $124.468     ↑ +6%
Tasa de Conversión: 3.2%      ↓ -0.5%
```

#### Exportar
- **PDF**: Informe completo con gráficos
- **Excel**: Datos crudos para análisis
- **CSV**: Compatibilidad universal

### Inventario

**Ruta**: `/admin/reportes/inventario`

#### Alertas de Stock
```
🔴 Stock Crítico (0-5 unidades): 8 productos
🟡 Stock Bajo (6-10 unidades): 15 productos
🟢 Stock Saludable (>10 unidades): 142 productos
```

#### Productos Sin Movimiento
```
Productos sin ventas en últimos 90 días: 23
[Ver Lista]
```

#### Valor de Inventario
```
Valor Total Inventario: $45.230.000 CLP
Promedio Costo por Unidad: $85.000
Total Unidades: 532
```

### Clientes

**Ruta**: `/admin/reportes/clientes`

#### Segmentación
```
Clientes Activos (compras últimos 30 días): 35
Clientes Inactivos (sin compras >90 días): 78
Nuevos Clientes (este mes): 12
```

#### Top Clientes
```
Cliente                 Total Gastado   Órdenes
Juan Pérez             $1.850.000      12
María González         $1.620.000      9
Carlos López           $1.340.000      7
```

---

## 🛠️ Solución de Problemas

### Problemas Comunes

#### 1. "No puedo crear productos"

**Síntomas**: Botón "Guardar" no funciona o error al crear producto

**Soluciones**:
1. Verifica que todos los campos obligatorios (*) estén completos
2. Revisa que el SKU sea único (no exista otro producto con ese SKU)
3. Confirma que la categoría seleccionada exista
4. Verifica que la imagen principal esté cargada (máx 5MB)
5. Revisa la consola del navegador (F12) para errores específicos

#### 2. "Stock no se descuenta al crear orden"

**Síntomas**: Vendes productos pero stock no baja

**Soluciones**:
1. Verifica que la orden esté en estado "Confirmada" (no "Draft")
2. Confirma que el producto tenga stock > 0 antes de la venta
3. Revisa logs del backend: `npm run -w backend dev` (busca errores en transacciones)
4. Ejecuta query manual:
   ```sql
   SELECT producto_id, stock FROM productos WHERE producto_id = X;
   ```

#### 3. "Cliente no recibe emails"

**Síntomas**: Notificaciones por email no llegan

**Soluciones**:
1. Verifica configuración SMTP en `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASS=tu_app_password
   ```
2. Confirma que notificaciones estén activadas en Configuración → Notificaciones
3. Revisa carpeta SPAM del cliente
4. Verifica logs del backend buscando "email" o "nodemailer"
5. Prueba con servicio de email de prueba (Ethereal) primero

#### 4. "Tabla de productos vacía/no carga"

**Síntomas**: Lista de productos muestra "Sin datos" o spinner infinito

**Soluciones**:
1. Abre DevTools (F12) → Network tab → busca request a `/api/productos`
2. Si hay error 401: Tu sesión expiró, vuelve a hacer login
3. Si hay error 500: Revisa logs del backend
4. Verifica que existan productos en la base de datos:
   ```bash
   npm run -w backend seed:products
   ```
5. Limpia caché del navegador (Ctrl+Shift+R)

#### 5. "Error al actualizar estado de orden"

**Síntomas**: No puedes cambiar estado de "Pendiente" a "Enviada"

**Soluciones**:
1. Verifica validaciones:
   - Para marcar como "Enviada", pago debe estar "Pagado"
   - Para marcar como "Completada", envío debe estar "Entregado"
2. Completa número de tracking si es obligatorio
3. Revisa permisos de tu usuario admin (debes tener permiso "Editar órdenes")

### Contacto de Soporte

Si el problema persiste:

📧 **Email**: soporte@moa.cl
📞 **Teléfono**: +56912345678
🕐 **Horario**: Lunes a Viernes, 9:00 - 18:00 CLT

Incluye en tu mensaje:
- Descripción detallada del problema
- Pasos para reproducirlo
- Screenshots (si aplica)
- Logs de consola (F12 → Console)
- Navegador y sistema operativo

---

## 📚 Recursos Adicionales

- [Guía de Troubleshooting Completa](./TROUBLESHOOTING.md)
- [Estado del Proyecto](./ESTADO_PROYECTO_NOV_2025.md)
- [Flujo de Compra Completo](./misDOCS/FLUJO_COMPRA_COMPLETO.md)
- [Guía de Contribución](./CONTRIBUTING.md)

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
