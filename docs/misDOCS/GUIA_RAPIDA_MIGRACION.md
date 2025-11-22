# Guía Rápida de Migración - Sistema de Mensajería MOA

## 🚀 Inicio Rápido

El sistema ya está configurado y listo para usar. Solo necesitas importar y usar:

```jsx
import { toast, confirm } from '@/components/ui'
```

## 📋 Tabla de Migración Rápida

### window.alert / window.confirm

| ❌ Antes | ✅ Ahora |
|---------|---------|
| `alert('Guardado')` | `toast.success('Guardado')` |
| `alert('Error')` | `toast.error('Error')` |
| `if (confirm('¿Eliminar?'))` | `if (await confirm.delete('¿Eliminar?'))` |
| `if (window.confirm('¿Continuar?'))` | `if (await confirm.warning('¿Continuar?'))` |

### SweetAlert2

| ❌ Antes | ✅ Ahora |
|---------|---------|
| `Swal.fire({ icon: 'success', title: 'Ok' })` | `toast.success('Ok')` |
| `Swal.fire({ icon: 'error', title: 'Error' })` | `toast.error('Error')` |
| `Swal.fire({ icon: 'info', title: 'Info' })` | `await confirm.info('Info')` |
| `Swal.fire({ icon: 'warning', showCancelButton: true })` | `await confirm.warning('Title', 'Text')` |

## 🎯 Casos de Uso Comunes

### 1. Feedback de Acción Exitosa

```jsx
// ❌ ANTES
Swal.fire({ icon: 'success', title: 'Guardado' })

// ✅ AHORA
toast.success('Guardado correctamente')
```

### 2. Error al Guardar

```jsx
// ❌ ANTES
Swal.fire({ 
  icon: 'error', 
  title: 'Error', 
  text: 'No se pudo guardar' 
})

// ✅ AHORA
toast.error('No se pudo guardar', { title: 'Error' })
```

### 3. Confirmación de Eliminación

```jsx
// ❌ ANTES
if (window.confirm('¿Eliminar?')) {
  deleteItem()
}

// ✅ AHORA
const confirmed = await confirm.delete(
  '¿Eliminar este elemento?',
  'Esta acción no se puede deshacer'
)
if (confirmed) {
  deleteItem()
}
```

### 4. Advertencia antes de Acción

```jsx
// ❌ ANTES
if (!confirm('Cambios sin guardar. ¿Salir?')) return

// ✅ AHORA
const ok = await confirm.warning(
  'Cambios sin guardar',
  '¿Deseas salir sin guardar?'
)
if (!ok) return
```

### 5. Información Simple

```jsx
// ❌ ANTES
alert('Sesión expirada')

// ✅ AHORA
toast.info('Sesión expirada')
```

### 6. Información que Requiere Confirmación

```jsx
// ❌ ANTES
Swal.fire({
  icon: 'info',
  title: 'Pedido confirmado',
  text: 'Tu pedido ha sido procesado'
})

// ✅ AHORA
await confirm.info(
  'Pedido confirmado',
  'Tu pedido ha sido procesado'
)
```

## 🔄 Patrones de Migración

### Patrón 1: Try-Catch con Feedback

```jsx
// ❌ ANTES
try {
  await saveData()
  Swal.fire({ icon: 'success', title: 'Guardado' })
} catch (error) {
  Swal.fire({ icon: 'error', title: 'Error', text: error.message })
}

// ✅ AHORA
try {
  await saveData()
  toast.success('Guardado correctamente')
} catch (error) {
  toast.error(error.message || 'Error al guardar')
}
```

### Patrón 2: Confirmación + Acción + Feedback

```jsx
// ❌ ANTES
if (!confirm('¿Eliminar?')) return
try {
  await deleteItem()
  alert('Eliminado')
} catch (error) {
  alert('Error: ' + error.message)
}

// ✅ AHORA
const confirmed = await confirm.delete(
  '¿Eliminar este elemento?',
  'Esta acción no se puede deshacer'
)
if (!confirmed) return

try {
  await deleteItem()
  toast.success('Elemento eliminado')
} catch (error) {
  toast.error('Error al eliminar: ' + error.message)
}
```

### Patrón 3: Loading + Success/Error

```jsx
// ❌ ANTES
Swal.fire({ title: 'Cargando...', didOpen: () => Swal.showLoading() })
try {
  await processData()
  Swal.fire({ icon: 'success', title: 'Completado' })
} catch (error) {
  Swal.fire({ icon: 'error', title: 'Error' })
}

// ✅ AHORA (simplificado)
try {
  await processData()
  toast.success('Completado correctamente')
} catch (error) {
  toast.error('Error al procesar')
}
```

### Patrón 4: Alert en Componente

```jsx
// ❌ ANTES
const [alert, setAlert] = useState(null)

const showAlert = (message, type) => {
  setAlert({ message, type })
  setTimeout(() => setAlert(null), 3000)
}

// En render:
{alert && <div className={`alert-${alert.type}`}>{alert.message}</div>}

// ✅ AHORA (sin estado)
import { toast } from '@/components/ui'

// Solo llama directamente:
toast.success('Operación exitosa')
toast.error('Error detectado')
```

## 🎨 Variantes Disponibles

### Toast (Notificaciones)
```jsx
toast.success('Mensaje')   // Verde - 3s
toast.error('Mensaje')     // Rojo - 4s
toast.warning('Mensaje')   // Amarillo - 3s
toast.info('Mensaje')      // Azul - 3s
```

### Confirm (Confirmaciones)
```jsx
confirm.delete(title, desc)    // Botón rojo "Eliminar"
confirm.warning(title, desc)   // Botón amarillo "Continuar"
confirm.info(title, desc)      // Solo "Aceptar"
```

### Alert (Inline)
```jsx
<AlertSuccess title="Título">Mensaje</AlertSuccess>
<AlertError title="Título">Mensaje</AlertError>
<AlertWarning title="Título">Mensaje</AlertWarning>
<AlertInfo>Mensaje</AlertInfo>
```

## 📦 Hooks Disponibles

```jsx
import { useToast, useConfirm } from '@/components/ui'

function MyComponent() {
  // Hook para toasts
  const { success, error, warning, info } = useToast()
  
  // Hook para confirmaciones
  const { confirmDelete, confirmWarning, confirmInfo } = useConfirm()
  
  const handleDelete = async () => {
    const ok = await confirmDelete('¿Eliminar?')
    if (ok) {
      success('Eliminado')
    }
  }
}
```

## ⚡ Tips de Migración

### 1. Buscar y Reemplazar

Busca en tu código:
- `alert(`
- `window.alert(`
- `confirm(`
- `window.confirm(`
- `Swal.fire(`

### 2. Orden de Migración Sugerido

1. **Primero**: `alert()` → `toast.*()` (más simple)
2. **Segundo**: `confirm()` → `confirm.*()` (requiere async/await)
3. **Tercero**: `Swal.fire()` → Sistema unificado
4. **Último**: Alerts con estado → Toasts

### 3. Testing

Después de migrar, verifica:
- ✅ Los mensajes aparecen correctamente
- ✅ Los colores son apropiados (success/error/warning/info)
- ✅ Las confirmaciones funcionan (async/await)
- ✅ No hay alerts nativos

### 4. No Migrar Todo de Inmediato

Puedes migrar gradualmente:
- SweetAlert2 y el nuevo sistema pueden coexistir
- Migra página por página o módulo por módulo
- Prioriza las páginas más usadas

## 🐛 Problemas Comunes

### No aparecen los toasts

**Problema**: Llamaste `toast.success()` pero no ves nada.

**Solución**: Verifica que `<MessageProvider />` esté en tu App:
```jsx
// En main.jsx o App.jsx
import { MessageProvider } from '@/components/ui'

<App />
<MessageProvider />
```

### Confirm no espera respuesta

**Problema**: El código continúa sin esperar la confirmación.

**Solución**: Usa `await`:
```jsx
// ❌ MAL
const ok = confirm.delete('¿Eliminar?')
if (ok) deleteItem() // ok es una Promise!

// ✅ BIEN
const ok = await confirm.delete('¿Eliminar?')
if (ok) deleteItem()
```

### Función no es async

**Problema**: No puedes usar `await` en función no-async.

**Solución**: Haz la función `async`:
```jsx
// ❌ MAL
function handleDelete() {
  const ok = await confirm.delete('¿Eliminar?')
}

// ✅ BIEN
async function handleDelete() {
  const ok = await confirm.delete('¿Eliminar?')
}
```

### Estilos no se aplican

**Problema**: Los componentes no tienen los estilos correctos.

**Solución**: Importa el CSS en `main.jsx`:
```jsx
import '@/styles/messaging-system.css'
```

## 📚 Recursos

- **Documentación completa**: `/docs/misDOCS/SISTEMA_MENSAJERIA.md`
- **Ejemplos**: `/docs/misDOCS/EJEMPLOS_MIGRACION_MENSAJERIA.md`
- **Demo visual**: `/frontend/src/modules/demo/pages/MessagingSystemDemo.jsx`

## ✅ Checklist de Migración

Para cada archivo que migres:

- [ ] Importar `toast` y/o `confirm`
- [ ] Reemplazar `alert()` con `toast.*()`
- [ ] Reemplazar `confirm()` con `confirm.*()`
- [ ] Agregar `async/await` donde sea necesario
- [ ] Reemplazar `Swal.fire()` con equivalente
- [ ] Eliminar imports de SweetAlert2 (opcional)
- [ ] Eliminar estado de alerts locales (si aplica)
- [ ] Probar en navegador
- [ ] Verificar colores y mensajes

## 🎓 Próximos Pasos

1. Lee la documentación completa
2. Prueba la página demo
3. Migra un archivo pequeño como prueba
4. Migra archivos más complejos gradualmente
5. Reporta cualquier problema o sugerencia

---

¿Dudas? Consulta la documentación completa o los ejemplos de migración.
