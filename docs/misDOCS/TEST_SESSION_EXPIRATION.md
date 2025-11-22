# Test Plan - Sistema de Expiración JWT

## 🎯 Objetivo
Verificar que el sistema de monitoreo de sesión funciona correctamente para clientes y admins.

---

## ✅ Checklist de Preparación

### Backend Setup
- [ ] Archivo `.env` configurado con:
  ```bash
  JWT_EXPIRES_IN=2m         
  JWT_ADMIN_EXPIRES_IN=7d    
  ```
- [ ] Backend corriendo en puerto 4000
- [ ] Base de datos `moa_db` creada y poblada

### Frontend Setup
- [ ] Dependencia instalada: `npm install jwt-decode`
- [ ] Frontend corriendo en puerto 5173
- [ ] Navegador con DevTools abierto (Console)

---

## 🧪 Test 1: Cliente Regular (2 minutos de sesión)

### Setup
1. Cambiar `.env` del backend:
   ```bash
   JWT_EXPIRES_IN=2m
   ```
2. Reiniciar backend: `npm run -w backend dev`

### Pasos

#### 1.1 Login como cliente
- [ ] Ir a http://localhost:5173/login
- [ ] Iniciar sesión con: `demo@moa.cl` / `demo`
- [ ] **Verificar en Console**: Mensaje `[AuthContext] Sesión expira s`
- [ ] **Resultado esperado**: Login exitoso, redirige al home

#### 1.2 Esperar warning (después de ~1:30 min)
- [ ] Esperar sin tocar nada
- [ ] **Verificar en Console**: Mensaje de warning cuando quedan ~30 segundos
- [ ] **Resultado esperado**: 
  - Modal aparece con título "Sesión por expirar"
  - Muestra el tiempo restante (para 2m, ~30 segundos)
  - Botones: "Cerrar sesión" y "Continuar navegando"
  - Modal NO se puede cerrar clickeando fuera

#### 1.3 Extender sesión
- [ ] Click en botón "Continuar navegando"
- [ ] **Verificar en Network tab**: Request `POST /auth/refresh-token`
- [ ] **Verificar respuesta**: Status 200, nuevo token
- [ ] **Resultado esperado**: 
  - Modal se cierra
  - Token renovado (2 minutos más)
  - No hay logout

#### 1.4 Dejar expirar (segunda ronda)
- [ ] Esperar otros 2 minutos sin tocar nada
- [ ] Modal aparece nuevamente
- [ ] Esta vez NO hacer click
- [ ] **Resultado esperado** (después de 2 min totales):
  - Logout automático
  - Redirección a `/login`
  - Alerta amber en top: "Sesión expirada"
  - **Verificar en Console**: Mensaje `[AuthContext] 🔒 Sesión expirada, cerrando...`
  - LocalStorage limpio (token, user, cart, wishlist)

---

## 🧪 Test 2: Admin (7 días de sesión)

### Setup
1. **NO cambiar** `.env` (admin usa `JWT_ADMIN_EXPIRES_IN=7d`)
2. Backend ya debe estar corriendo

### Pasos

#### 2.1 Login como admin
- [ ] Ir a http://localhost:5173/login
- [ ] Iniciar sesión con: `admin@moa.cl` / `admin`
- [ ] **Verificar en Console**: Monitor se activa
- [ ] **Resultado esperado**: Login exitoso, redirige al home o dashboard

#### 2.2 Verificar que NO aparece modal
- [ ] Navegar por la app 2-3 minutos
- [ ] Ir a diferentes páginas
- [ ] **Resultado esperado**: 
  - Modal de expiración **NO aparece** (admin tiene 7 días)
  - Console muestra mensajes de monitor pero sin warnings
  - Sesión permanece activa

#### 2.3 Verificar expiración manual (opcional)
Para forzar expiración de admin:
- [ ] Cambiar `.env`: `JWT_ADMIN_EXPIRES_IN=2m`
- [ ] Reiniciar backend
- [ ] Hacer logout manual y re-login como admin
- [ ] Esperar 2 minutos
- [ ] **Resultado esperado**: Modal NO aparece (código excluye admin del warning)
- [ ] Pero logout automático SÍ ocurre después de 2 min

---

## 🧪 Test 3: StyleGuide Lab

### Pasos

#### 3.1 Ver modal en StyleGuide
- [ ] Ir a http://localhost:5173/styleguide
- [ ] Scroll hasta sección "Session Expiration Dialog"
- [ ] Click en "Abrir Modal de Sesión"
- [ ] **Resultado esperado**:
  - Modal aparece correctamente
  - Muestra "5 minutos"
  - Botones funcionales
  - Click en "Continuar" → alert "Sesión extendida ✅"
  - Click en "Cerrar sesión" → alert "Logout ejecutado 🚪"

---

## 🧪 Test 4: Edge Cases

### 4.1 Logout manual antes de expirar
- [ ] Login como cliente
- [ ] Esperar que aparezca modal (1:30 min)
- [ ] Hacer logout manual desde navbar
- [ ] **Resultado esperado**: 
  - Modal desaparece
  - Logout normal sin alerta de "expirada"

### 4.2 Cambiar de página con modal abierto
- [ ] Login como cliente
- [ ] Esperar modal
- [ ] Navegar a otra página usando navbar
- [ ] **Resultado esperado**: 
  - Modal permanece visible (fixed position)
  - Sigue funcionando correctamente

### 4.3 Refresh de página con sesión activa
- [ ] Login como cliente
- [ ] Esperar 30 segundos
- [ ] Presionar F5 (refresh)
- [ ] **Resultado esperado**:
  - Sesión se mantiene
  - Monitor se reinicia
  - Token sigue siendo el mismo (no se renueva con refresh)

### 4.4 Token ya expirado al cargar página
- [ ] Login como cliente
- [ ] Esperar 2 minutos completos (hasta expiración)
- [ ] Cerrar tab
- [ ] Reabrir http://localhost:5173
- [ ] **Resultado esperado**:
  - AuthContext detecta token expirado
  - Limpieza automática en background
  - NO muestra alerta (no fue logout activo)
  - Estado: `isAuthenticated: false`

---

## 📊 Resultados Esperados

| Escenario | Cliente (2 min) | Admin (7 días) |
|-----------|------------------|----------------|
| Warning aparece | ✅ Sí (~1:30 min) | ❌ No |
| Modal bloqueante | ✅ Sí | ❌ No |
| Puede extender | ✅ Sí | ❌ N/A |
| Logout automático | ✅ Sí (a los 2 min) | ✅ Sí (al expirar el token) |
| Alerta "Sesión expirada" | ✅ Sí | ✅ Sí |

---

## 🐛 Problemas Conocidos / Notas

### Dependencia faltante
Si ves error `jwtDecode is not defined`:
```bash
cd frontend
npm install jwt-decode
```

### Modal no aparece
Verificar en Console:
- ¿Hay errores de importación?
- ¿El hook `useSessionMonitor` se está ejecutando?
- ¿El token tiene campo `exp`?

### Backend no genera token con exp
Verificar que `authController.js` use `jwt.sign()` con `expiresIn`.

---

## ✅ Checklist Final

- [ ] Test 1 (Cliente) completado
- [ ] Test 2 (Admin) completado
- [ ] Test 3 (StyleGuide) completado
- [ ] Test 4 (Edge Cases) completado
- [ ] No hay errores en Console
- [ ] No hay errores en Network tab
- [ ] localStorage se limpia correctamente al expirar
- [ ] UX es clara y no confusa

---

## 📝 Notas del Test

**Fecha**: ___________  
**Testeador**: ___________  
**Resultado**: ⬜ Pasó ⬜ Falló  

**Observaciones**:
```
[Espacio para notas]
```
