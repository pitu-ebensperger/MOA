# 🎨 Sistema Unificado de Mensajería MOA

Sistema homologado de alertas, modales, toasts y confirmaciones para la aplicación MOA.

## 📁 Estructura de Archivos

```
frontend/src/
├── components/ui/
│   ├── Alert.jsx                    ✅ Actualizado
│   ├── Modal.jsx                    ✅ Actualizado
│   ├── Toast.jsx                    ✨ NUEVO
│   ├── ConfirmDialog.jsx            ✨ NUEVO
│   ├── MessageProvider.jsx          ✨ NUEVO
│   └── index.js                     ✅ Actualizado
├── styles/
│   └── messaging-system.css         ✨ NUEVO
├── modules/demo/pages/
│   └── MessagingSystemDemo.jsx      ✨ NUEVO (demo visual)
└── app/
    └── main.jsx                     ✅ Actualizado

docs/misDOCS/
├── SISTEMA_MENSAJERIA.md            ✨ Documentación completa
├── EJEMPLOS_MIGRACION_MENSAJERIA.md ✨ Ejemplos prácticos
├── GUIA_RAPIDA_MIGRACION.md         ✨ Guía rápida
└── RESUMEN_SISTEMA_MENSAJERIA.md    ✨ Resumen ejecutivo
```

## 🚀 Inicio Rápido

### 1. Importar

```jsx
import { toast, confirm } from '@/components/ui'
```

### 2. Usar

```jsx
// Toast (notificación rápida)
toast.success('Guardado correctamente')

// Confirm (confirmación)
const ok = await confirm.delete('¿Eliminar?')
if (ok) deleteItem()
```

¡Eso es todo! El sistema ya está configurado y listo para usar.

## 📚 Documentación

### Documentos Disponibles

1. **[SISTEMA_MENSAJERIA.md](./SISTEMA_MENSAJERIA.md)**
   - Guía completa de uso
   - Props y opciones detalladas
   - Ejemplos de cada componente
   - ⏱️ Lectura: 10-15 minutos

2. **[EJEMPLOS_MIGRACION_MENSAJERIA.md](./EJEMPLOS_MIGRACION_MENSAJERIA.md)**
   - 8 ejemplos prácticos antes/después
   - Casos reales de la aplicación
   - Patrones comunes
   - ⏱️ Lectura: 5-10 minutos

3. **[GUIA_RAPIDA_MIGRACION.md](./GUIA_RAPIDA_MIGRACION.md)**
   - Tabla de equivalencias
   - Casos de uso comunes
   - Troubleshooting
   - ⏱️ Lectura: 5 minutos

4. **[RESUMEN_SISTEMA_MENSAJERIA.md](./RESUMEN_SISTEMA_MENSAJERIA.md)**
   - Resumen ejecutivo
   - Métricas de implementación
   - Próximos pasos
   - ⏱️ Lectura: 3 minutos

## 🎯 Componentes

### Toast (Notificaciones Flotantes)

Mensajes temporales que aparecen en la esquina superior derecha.

```jsx
toast.success('Operación exitosa')
toast.error('Ocurrió un error')
toast.warning('Ten cuidado')
toast.info('Información útil')
```

**Características:**
- ⏱️ Desaparecen automáticamente (3-4s)
- 🎨 Diseño consistente
- 📱 Responsive
- 🔔 No intrusivo

### Confirm Dialog (Confirmaciones)

Diálogos modales para acciones importantes.

```jsx
const ok = await confirm.delete('¿Eliminar?', 'No se puede deshacer')
const ok = await confirm.warning('¿Continuar?', 'Cambios sin guardar')
await confirm.info('Título', 'Descripción')
```

**Características:**
- 🎯 Basado en promesas (async/await)
- 🎨 3 variantes (danger, warning, info)
- ⌨️ Navegación por teclado
- 🔒 Overlay con blur

### Alert (Inline)

Mensajes contextuales dentro del contenido.

```jsx
<AlertSuccess title="Éxito">Operación completada</AlertSuccess>
<AlertError title="Error" dismissible>Algo salió mal</AlertError>
<AlertWarning title="Advertencia">Ten cuidado</AlertWarning>
<AlertInfo dismissible>Información importante</AlertInfo>
```

**Características:**
- 📍 Integrado en el contenido
- 🔔 Persistente hasta cerrar
- 🎨 4 variantes
- ❌ Opcionalmente dismissible

### Modal

Diálogos para contenido complejo.

```jsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  footer={<Button>Guardar</Button>}
>
  {/* Contenido */}
</Modal>
```

**Características:**
- 🎨 5 tamaños (sm, md, lg, xl, full)
- 📍 2 placements (center, right)
- 🔄 Animaciones suaves
- 🚫 Previene scroll del body

## 🎨 Paleta Visual

Todos los componentes comparten:

```css
/* Colores de Variantes */
Success: #7A8B6F  /* Verde suave */
Error:   #B8836B  /* Rojo terracota */
Warning: #B8956A  /* Dorado */
Info:    #6B5D52  /* Gris azulado */

/* Radios */
--radius-lg: 0.625rem
--radius-xl: 1rem

/* Sombras */
--shadow-md: 0 4px 6px -1px rgba(16, 14, 8, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(16, 14, 8, 0.1)
```

## 📊 Tabla Comparativa

| Componente | Uso | Duración | Interrupción |
|------------|-----|----------|--------------|
| **Toast** | Feedback rápido | 3-4s | Mínima |
| **Confirm** | Confirmaciones | Usuario decide | Alta |
| **Alert** | Info persistente | Hasta cerrar | Baja |
| **Modal** | Contenido complejo | Hasta cerrar | Alta |

## 🔄 Migración

### Desde window.alert/confirm

```jsx
// ❌ Antes
alert('Guardado')
if (confirm('¿Eliminar?')) deleteItem()

// ✅ Ahora
toast.success('Guardado')
if (await confirm.delete('¿Eliminar?')) deleteItem()
```

### Desde SweetAlert2

```jsx
// ❌ Antes
Swal.fire({ icon: 'success', title: 'Ok' })

// ✅ Ahora
toast.success('Ok')
```

Ver [GUIA_RAPIDA_MIGRACION.md](./GUIA_RAPIDA_MIGRACION.md) para más ejemplos.

## 🛠️ Instalación

Ya está todo configurado! El sistema incluye:

✅ Componentes creados e integrados  
✅ Estilos importados  
✅ MessageProvider agregado  
✅ Exports en index.js  

Solo necesitas importar y usar:

```jsx
import { toast, confirm } from '@/components/ui'
```

## 🎓 Aprender Más

### Para Empezar
1. Lee la [Guía Rápida](./GUIA_RAPIDA_MIGRACION.md) (5 min)
2. Prueba la [Página Demo](#demo)
3. Migra un archivo pequeño

### Demo Visual

Agrega temporalmente esta ruta para probar el sistema:

```jsx
// En App.jsx
import { MessagingSystemDemo } from '@/modules/demo/pages/MessagingSystemDemo'

<Route path="/demo/messaging" element={<MessagingSystemDemo />} />
```

Luego visita: `http://localhost:5173/demo/messaging`

### Para Profundizar
1. [Documentación Completa](./SISTEMA_MENSAJERIA.md)
2. [Ejemplos de Migración](./EJEMPLOS_MIGRACION_MENSAJERIA.md)
3. [Resumen Ejecutivo](./RESUMEN_SISTEMA_MENSAJERIA.md)

## 💡 Tips

### Uso con Hooks

```jsx
import { useToast, useConfirm } from '@/components/ui'

function MyComponent() {
  const { success, error } = useToast()
  const { confirmDelete } = useConfirm()
  
  const handleDelete = async () => {
    const ok = await confirmDelete('¿Eliminar?')
    if (ok) {
      success('Eliminado')
    }
  }
}
```

### Try-Catch con Feedback

```jsx
try {
  await saveData()
  toast.success('Guardado')
} catch (error) {
  toast.error(error.message || 'Error al guardar')
}
```

### Toast Persistente

```jsx
toast.success('Este mensaje no desaparece', {
  duration: Infinity
})
```

## 🐛 Troubleshooting

### Los toasts no aparecen

Verifica que `<MessageProvider />` esté en tu App:
```jsx
<App />
<MessageProvider />
```

### El confirm no espera

Usa `await`:
```jsx
const ok = await confirm.delete('¿Eliminar?')
```

### Estilos no se aplican

Importa el CSS:
```jsx
import '@/styles/messaging-system.css'
```

Ver más en [Guía Rápida - Troubleshooting](./GUIA_RAPIDA_MIGRACION.md#-problemas-comunes)

## ✅ Checklist de Migración

Para cada archivo:

- [ ] Importar `toast` y/o `confirm`
- [ ] Reemplazar `alert()` con `toast.*()`
- [ ] Reemplazar `confirm()` con `confirm.*()`
- [ ] Agregar `async/await` si es necesario
- [ ] Probar en navegador
- [ ] Verificar colores y mensajes

## 🎯 Casos de Uso

### Guardar Formulario
```jsx
try {
  await saveData()
  toast.success('Guardado')
  onClose()
} catch (error) {
  toast.error('Error al guardar')
}
```

### Eliminar Elemento
```jsx
const ok = await confirm.delete(
  '¿Eliminar este producto?',
  'Esta acción no se puede deshacer'
)
if (ok) {
  await deleteProduct()
  toast.success('Producto eliminado')
}
```

### Advertencia
```jsx
const ok = await confirm.warning(
  'Cambios sin guardar',
  '¿Deseas salir sin guardar?'
)
if (ok) {
  navigate('/back')
}
```

## 📈 Beneficios

### Para Usuarios
- ✅ Experiencia consistente
- ✅ Menos intrusivo
- ✅ Animaciones suaves
- ✅ Responsive

### Para Desarrolladores
- ✅ API limpia
- ✅ Menos código
- ✅ Type-safe
- ✅ Hooks personalizados

### Para el Proyecto
- ✅ Menos dependencias
- ✅ Bundle más pequeño
- ✅ Consistencia visual
- ✅ Escalable

## 📝 Recursos

- **Documentación**: Ver carpeta `docs/misDOCS/`
- **Demo**: `frontend/src/modules/demo/pages/MessagingSystemDemo.jsx`
- **Componentes**: `frontend/src/components/ui/`
- **Estilos**: `frontend/src/styles/messaging-system.css`

## 🙏 Créditos

Sistema diseñado para MOA con inspiración de:
- Chakra UI
- Radix UI
- Shadcn/ui

## 📄 Licencia

Parte del proyecto MOA.

---

**¿Preguntas?** Consulta la documentación o los ejemplos de migración.
