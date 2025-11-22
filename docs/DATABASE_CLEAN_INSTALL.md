# 🗄️ Guía de Instalación Limpia de Base de Datos - MOA

**Versión:** 1.0.0 (Production Ready)  
**Fecha:** 22 de noviembre, 2025  
**Base de Datos:** PostgreSQL 17+

---

## 📋 Resumen

Esta guía describe el proceso para instalar una base de datos **LIMPIA** de MOA, lista para producción, eliminando la base de datos de desarrollo actual y creando una versión final optimizada.

---

## ✨ Mejoras Consolidadas en Versión Final

### 1. **Schema DDL.sql Consolidado**
- ✅ **Constraints validados** en métodos de pago (`transferencia`, `webpay`, `tarjeta_credito`, etc.)
- ✅ **Constraints validados** en estados de orden (`draft`, `confirmed`, `cancelled`)
- ✅ **Constraints validados** en estados de pago y envío
- ✅ **Índices optimizados** para queries más rápidos (analytics, búsquedas, filtros)
- ✅ **Función update_updated_at()** para auditoría automática
- ✅ **Extensión pg_trgm** para búsquedas por similitud
- ✅ **Comentarios descriptivos** en todas las tablas y columnas críticas

### 2. **Migraciones Eliminadas**
Las siguientes migraciones YA ESTÁN consolidadas en `DDL.sql`:
- ~~`001_add_estado_orden.sql`~~ → Integrado en DDL
- ~~`002_password_reset_tokens.sql`~~ → Integrado en DDL
- ~~`004_add_estado_orden_column.sql`~~ → Integrado en DDL
- ~~`008_add_payment_method_validation.sql`~~ → Integrado en DDL

**Acción:** Puedes eliminar la carpeta `database/schema/migrations/` después de la instalación limpia.

### 3. **Seeds Validados**
Orden correcto de ejecución (respeta foreign keys):
```
1. users       → Crea admin@moa.cl y limpia usuarios extra
2. clients     → (Deprecado, se puede omitir)
3. categories  → 8 categorías de productos
4. products    → 33 productos con stock e imágenes
5. addresses   → Direcciones de demo
6. orders      → Órdenes históricas (valida productos existen)
7. carts       → Carritos activos
8. wishlists   → Listas de deseos
```

---

## 🚀 Instalación Paso a Paso

### **Opción A: Script Automático (Recomendado)**

```bash
# 1. Navegar a backend
cd backend

# 2. Ejecutar script de instalación
npm run db:install

# Esto ejecutará:
# - Eliminación de database 'moa' actual
# - Creación de schema desde DDL.sql consolidado
# - Ejecución de todos los seeds en orden correcto
# - Verificación de tablas creadas
```

**Salida esperada:**
```
╔════════════════════════════════════════════════════════╗
║        MOA E-COMMERCE DATABASE INSTALLER              ║
║              Production Ready v1.0.0                   ║
╚════════════════════════════════════════════════════════╝

📋 Configuration:
  Database User: postgres
  Database Name: moa
  Schema File: /path/to/DDL.sql

🔍 Pre-flight checks...
✅ All pre-flight checks passed

⚠️  WARNING: This will DELETE the existing 'moa' database
Are you sure you want to continue? (yes/no): yes

🚀 Starting database installation...

[1/3] Creating database schema...
✅ Schema created successfully

[2/3] Verifying tables...
✅ 13 tables created

[3/3] Seeding initial data...
✅ Initial data seeded successfully

╔════════════════════════════════════════════════════════╗
║          ✅ INSTALLATION COMPLETED                     ║
╚════════════════════════════════════════════════════════╝

📊 Database Summary:
  👥 Users: 1
  📦 Products: 33
  🏷️  Categories: 8
  🛒 Orders: 5

🔑 Test Credentials:
  Admin: admin@moa.cl / admin
  Demo: demo@moa.cl / demo

Database is ready for production! 🎉
```

---

### **Opción B: Manual (Paso a Paso)**

```bash
# 1. Eliminar database actual
psql -U postgres -c "DROP DATABASE IF EXISTS moa;"

# 2. Crear schema desde DDL consolidado
psql -U postgres -f database/schema/DDL.sql

# 3. Verificar tablas creadas
psql -U postgres -d moa -c "\dt"

# 4. Ejecutar seeds en orden correcto
npm run seed:all

# 5. Verificar datos
psql -U postgres -d moa -c "SELECT COUNT(*) FROM usuarios;"
psql -U postgres -d moa -c "SELECT COUNT(*) FROM productos;"
psql -U postgres -d moa -c "SELECT COUNT(*) FROM ordenes;"
```

---

## 🔍 Verificación Post-Instalación

### 1. **Verificar Estructura de Tablas**

```bash
# Listar todas las tablas
psql -U postgres -d moa -c "\dt"

# Debe mostrar:
# - usuarios
# - password_reset_tokens
# - categorias
# - direcciones
# - productos
# - carritos
# - carrito_items
# - wishlists
# - wishlist_items
# - ordenes
# - orden_items
# - configuracion_tienda
```

### 2. **Verificar Constraints**

```bash
# Verificar constraints de ordenes (más críticos)
psql -U postgres -d moa -c "
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'ordenes'::regclass
ORDER BY conname;
"

# Debe mostrar:
# - check_estado_orden (draft, confirmed, cancelled)
# - check_metodo_pago (transferencia, webpay, tarjeta_credito, etc.)
# - ordenes_metodo_despacho_check (standard, express, retiro)
# - ordenes_estado_pago_check (pendiente, pagado, rechazado, reembolsado)
# - ordenes_estado_envio_check (preparacion, enviado, en_transito, entregado, cancelado)
```

### 3. **Verificar Índices**

```bash
# Listar índices de tabla ordenes
psql -U postgres -d moa -c "\d+ ordenes"

# Debe incluir:
# - idx_ordenes_usuario
# - idx_ordenes_estado_pago
# - idx_ordenes_estado_envio
# - idx_ordenes_creado_en
# - idx_ordenes_estado_creado
# - idx_ordenes_analytics (WHERE estado_orden = 'confirmed')
```

### 4. **Probar Flujos Críticos**

```bash
# Test 1: Crear orden y validar stock
psql -U postgres -d moa -c "
BEGIN;

-- Obtener stock actual de un producto
SELECT nombre, stock FROM productos WHERE producto_id = 1;

-- Simular creación de orden (sin ejecutar orderModel.js)
-- Verificar que stock se puede decrementar
UPDATE productos SET stock = stock - 2 WHERE producto_id = 1;

-- Verificar nuevo stock
SELECT nombre, stock FROM productos WHERE producto_id = 1;

ROLLBACK; -- No aplicar cambios
"

# Test 2: Validar constraint de método de pago
psql -U postgres -d moa -c "
-- Esto DEBE fallar (método inválido)
INSERT INTO ordenes (order_code, usuario_id, total_cents, metodo_pago)
VALUES ('TEST-001', 1, 10000, 'bitcoin');
"
# Salida esperada:
# ERROR: new row for relation "ordenes" violates check constraint "check_metodo_pago"

# Test 3: Validar estado_orden
psql -U postgres -d moa -c "
-- Esto DEBE fallar (estado inválido)
INSERT INTO ordenes (order_code, usuario_id, total_cents, estado_orden)
VALUES ('TEST-002', 1, 10000, 'processing');
"
# Salida esperada:
# ERROR: new row for relation "ordenes" violates check constraint "check_estado_orden"
```

### 5. **Verificar Seeds**

```bash
# Usuarios (debe haber 1: admin@moa.cl)
psql -U postgres -d moa -c "SELECT email, rol_code FROM usuarios;"

# Productos (debe haber 33)
psql -U postgres -d moa -c "SELECT COUNT(*), COUNT(DISTINCT categoria_id) FROM productos;"

# Categorías (debe haber 8)
psql -U postgres -d moa -c "SELECT nombre FROM categorias ORDER BY categoria_id;"

# Órdenes demo (debe haber 5+)
psql -U postgres -d moa -c "
SELECT 
  order_code, 
  estado_orden, 
  estado_pago, 
  metodo_pago
FROM ordenes
ORDER BY creado_en DESC
LIMIT 5;
"
```

---

## 🧹 Limpieza Post-Instalación

Una vez verificado que todo funciona correctamente:

```bash
# 1. Eliminar carpeta de migraciones obsoletas
rm -rf backend/database/schema/migrations/

# 2. Eliminar archivo DML.sql si no se usa
rm backend/database/schema/DML.sql

# 3. Eliminar seeds de clientes (deprecado)
rm backend/database/seed/clientsData.js
rm backend/database/seed/clientsSeed.js
```

---

## 🚨 Troubleshooting

### Error: `psql: command not found`

```bash
# macOS
brew install postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-client-17
```

### Error: `database "moa" already exists`

```bash
# Forzar eliminación
psql -U postgres -c "DROP DATABASE moa WITH (FORCE);"

# Luego volver a ejecutar
npm run db:install
```

### Error: `permission denied for relation usuarios`

```bash
# Otorgar permisos al usuario
psql -U postgres -d moa -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
"
```

### Error en Seeds: `violates foreign key constraint`

**Causa:** Seeds ejecutados en orden incorrecto.

**Solución:**
```bash
# Ejecutar en orden correcto (automático con seed:all)
npm run seed:users
npm run seed:categories
npm run seed:products
npm run seed:addresses
npm run seed:orders
npm run seed:carts
npm run seed:wishlists
```

### Verificar orden de ejecución actual:

```bash
# Ver script seed:all
grep -A 1 '"seed:all"' backend/package.json
```

**Debe ser:**
```json
"seed:all": "npm run seed:users && npm run seed:clients && npm run seed:categories && npm run seed:products && npm run seed:addresses && npm run seed:orders && npm run seed:carts && npm run seed:wishlists"
```

---

## 📊 Comparación: Antes vs Después

| Característica | Antes (Dev) | Después (Production) |
|----------------|-------------|----------------------|
| Migraciones | 4 archivos .sql separados | ❌ Eliminadas (consolidado en DDL) |
| Constraints | Parciales, solo en código | ✅ Validación a nivel BD |
| Índices | Básicos | ✅ Optimizados (analytics, búsquedas) |
| Comentarios | Mínimos | ✅ Documentación completa |
| Seeds | Orden manual | ✅ Automatizado con validación |
| Estado orden | Sin validar | ✅ CHECK constraint (draft, confirmed, cancelled) |
| Métodos pago | Sin validar | ✅ CHECK constraint (6 métodos permitidos) |
| Performance | Buena | ✅ Excelente (índices optimizados) |

---

## 🎯 Checklist Final

Antes de desplegar a producción, verifica:

- [ ] ✅ Base de datos instalada sin errores
- [ ] ✅ Todas las tablas creadas (13 tablas)
- [ ] ✅ Constraints de ordenes validados
- [ ] ✅ Índices creados correctamente
- [ ] ✅ Seeds ejecutados (users, categories, products, orders)
- [ ] ✅ Usuario admin existe: `admin@moa.cl`
- [ ] ✅ Test login funciona en frontend
- [ ] ✅ Crear orden descuenta stock correctamente
- [ ] ✅ Validación de métodos de pago funciona
- [ ] ✅ Carpeta migrations/ eliminada
- [ ] ✅ Backup de database dev anterior (opcional)

---

## 📚 Referencias

- **Schema Principal:** `backend/database/schema/DDL.sql`
- **Script Instalación:** `backend/scripts/install-database.sh`
- **Seeds:** `backend/database/seed/*Seed.js`
- **Documentación Técnica:** `docs/FIXES_CRITICOS_NOV_2025.md`

---

## 🆘 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs del script de instalación
2. Verifica las pre-condiciones (PostgreSQL corriendo, usuario con permisos)
3. Consulta el troubleshooting arriba
4. Ejecuta manualmente paso a paso (Opción B)

---

**¡Base de datos lista para producción!** 🚀

Una vez completada la instalación, puedes eliminar tu base de datos de desarrollo y trabajar con esta versión limpia y optimizada.
