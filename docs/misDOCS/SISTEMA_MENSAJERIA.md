# Sistema Unificado de Mensajería MOA

Sistema homologado y consistente para todas las alertas, modales, toasts y confirmaciones en la aplicación.

## 🎨 Diseño Visual

Todos los componentes del sistema comparten:

- **Paleta de colores**: Derivada de `tokens.css` (primary, success, warning, error)
- **Tipografía**: `var(--font-sans)` con pesos consistentes
- **Espaciado**: Escala unificada de `var(--spacing-*)`
- **Bordes**: `var(--radius-lg)` y `var(--radius-xl)`
- **Sombras**: `var(--shadow-md)` y `var(--shadow-xl)`
- **Animaciones**: Transiciones suaves con `cubic-bezier(0.22, 1, 0.36, 1)`

## 📦 Componentes Disponibles

### 1. Toast (Notificaciones Flotantes)

Mensajes breves que aparecen temporalmente en la esquina superior derecha.

```jsx
import { toast, useToast } from '@/components/ui'

// Uso directo
toast.success('Producto agregado al carrito')
toast.error('Error al procesar el pago')
toast.warning('Stock limitado disponible')
toast.info('Nueva versión disponible')

// Con título y opciones
toast.success('¡Pedido confirmado!', {
  title: 'Éxito',
  duration: 5000
})

// Hook en componentes
function MyComponent() {
  const { success, error } = useToast()
  
  const handleSave = async () => {
    try {
      await saveData()
      success('Datos guardados correctamente')
    } catch (err) {
      error('No se pudieron guardar los datos')
    }
  }
}
```

**Variantes:**
- `toast.success(message, options?)` - Verde, 3s
- `toast.error(message, options?)` - Rojo, 4s
- `toast.warning(message, options?)` - Amarillo, 3s
- `toast.info(message, options?)` - Azul, 3s
- `toast.custom(options)` - Personalizado

**Opciones:**
```typescript
{
  title?: string
  message: string
  duration?: number | Infinity
  icon?: Component
  variant?: 'success' | 'error' | 'warning' | 'info'
}
```

### 2. Confirm Dialog (Diálogos de Confirmación)

Diálogos modales para confirmaciones importantes con botones de acción.

```jsx
import { confirm, useConfirm } from '@/components/ui'

// Confirmación de eliminación
const confirmed = await confirm.delete(
  '¿Eliminar producto?',
  'Esta acción no se puede deshacer'
)
if (confirmed) {
  deleteProduct()
}

// Confirmación de advertencia
const shouldContinue = await confirm.warning(
  'Cambios sin guardar',
  '¿Deseas salir sin guardar los cambios?'
)

// Confirmación informativa (solo "Aceptar")
await confirm.info(
  'Pedido procesado',
  'Tu pedido #12345 ha sido confirmado'
)

// Hook en componentes
function ProductList() {
  const { confirmDelete } = useConfirm()
  
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      '¿Eliminar este producto?',
      'No podrás recuperarlo después'
    )
    if (confirmed) {
      await deleteProduct(id)
    }
  }
}
```

**Variantes:**
- `confirm.delete(title, description?)` - Botón rojo "Eliminar"
- `confirm.warning(title, description, options?)` - Botón amarillo "Continuar"
- `confirm.info(title, description, options?)` - Sin botón cancelar
- `confirm.custom(options)` - Personalizado

**Opciones:**
```typescript
{
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  variant?: 'danger' | 'warning' | 'info'
  icon?: Component
  persistent?: boolean // No cerrar al hacer clic fuera
}
```

### 3. Alert (Alertas Inline)

Mensajes contextulares que se muestran dentro del contenido de la página.

```jsx
import { Alert, AlertSuccess, AlertError } from '@/components/ui'

// Componente básico
<Alert 
  variant="success"
  title="Pedido confirmado"
  dismissible
  onDismiss={() => console.log('Alert cerrada')}
>
  Tu pedido #12345 está en camino
</Alert>

// Componentes de atajo
<AlertSuccess title="Éxito">
  Operación completada correctamente
</AlertSuccess>

<AlertError title="Error" dismissible>
  No se pudo procesar la solicitud
</AlertError>

<AlertWarning title="Advertencia">
  Stock limitado disponible
</AlertWarning>

<AlertInfo>
  Información importante para el usuario
</AlertInfo>

// Sin título (solo mensaje)
<Alert variant="info">
  Mensaje simple sin título
</Alert>
```

**Props:**
```typescript
{
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  icon?: Component
  className?: string
}
```

### 4. Modal

Diálogos modales para contenido complejo y formularios.

```jsx
import { Modal, Button } from '@/components/ui'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>
      
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Editar Producto"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </>
        }
      >
        {/* Contenido del modal */}
        <form>
          {/* ... */}
        </form>
      </Modal>
    </>
  )
}

// Modal lateral (drawer)
<Modal
  open={isOpen}
  onClose={onClose}
  title="Filtros"
  placement="right"
>
  {/* Contenido */}
</Modal>
```

**Props:**
```typescript
{
  open: boolean
  onClose: () => void
  title?: string | ReactNode
  children: ReactNode
  placement?: 'center' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  footer?: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}
```

## 🚀 Instalación

### 1. Agregar el MessageProvider

En tu componente raíz (App.jsx o layout principal):

```jsx
import { MessageProvider } from '@/components/ui'

function App() {
  return (
    <>
      <Router>
        <YourRoutes />
      </Router>
      
      {/* Agregar al final, fuera del router */}
      <MessageProvider />
    </>
  )
}
```

### 2. Importar estilos

En tu archivo principal de estilos o en `main.jsx`:

```jsx
import '@/styles/messaging-system.css'
```

## 🎯 Guía de Uso

### ¿Cuándo usar cada componente?

| Componente | Uso ideal | Duración | Interrupción |
|------------|-----------|----------|--------------|
| **Toast** | Feedback rápido de acciones | 3-4s | Mínima |
| **Confirm** | Acciones destructivas o importantes | Hasta que el usuario decida | Alta |
| **Alert** | Información contextual persistente | Persistente | Baja |
| **Modal** | Formularios, contenido complejo | Hasta que se cierre | Alta |

### Ejemplos de uso común

#### Eliminar un elemento
```jsx
// ❌ NO hacer (nativo)
if (window.confirm('¿Eliminar?')) {
  deleteItem()
}

// ✅ Hacer (sistema unificado)
const confirmed = await confirm.delete(
  '¿Eliminar este producto?',
  'Esta acción no se puede deshacer'
)
if (confirmed) {
  await deleteItem()
  toast.success('Producto eliminado')
}
```

#### Guardar un formulario
```jsx
const handleSubmit = async (data) => {
  try {
    await saveData(data)
    toast.success('Datos guardados correctamente')
    onClose()
  } catch (error) {
    toast.error('Error al guardar: ' + error.message)
  }
}
```

#### Mostrar información importante
```jsx
// Si es temporal y no crítico: Toast
toast.info('Nueva versión disponible')

// Si necesita ser visible hasta que el usuario lo vea: Alert
<Alert variant="info" dismissible>
  Tenemos nuevas características disponibles
</Alert>

// Si requiere acción del usuario: Confirm
await confirm.info(
  'Actualización requerida',
  'Por favor actualiza la página para continuar'
)
```

## 🎨 Personalización

### Colores personalizados

Los colores se heredan de `tokens.css`. Para cambiar los colores del sistema:

```css
/* tokens.css */
:root {
  --color-success: #7A8B6F;  /* Verde MOA */
  --color-warning: #B8956A;  /* Amarillo MOA */
  --color-error: #B8836B;    /* Rojo MOA */
  --color-secondary2: #6B5D52; /* Azul/Info MOA */
}
```

### Duraciones de toast

```jsx
// Toast que permanece hasta cerrar manualmente
toast.success('Operación completada', {
  duration: Infinity
})

// Toast rápido (1.5s)
toast.info('Copiado', { duration: 1500 })
```

## 🔄 Migración desde SweetAlert2

### Antes (SweetAlert2)
```jsx
import Swal from 'sweetalert2'

Swal.fire({
  icon: 'success',
  title: 'Guardado',
  text: 'Los cambios fueron guardados'
})
```

### Ahora (Sistema Unificado)
```jsx
import { toast } from '@/components/ui'

toast.success('Los cambios fueron guardados', {
  title: 'Guardado'
})
```

### Ventajas de migrar

1. ✅ **Consistencia visual** - Todos los mensajes se ven igual
2. ✅ **Menor peso** - No necesitas cargar toda la librería SweetAlert2
3. ✅ **Mejor UX** - Toasts menos intrusivos para acciones comunes
4. ✅ **TypeScript ready** - Mejor autocompletado
5. ✅ **Más flexible** - Componentes React nativos

## 🐛 Troubleshooting

### Los toasts no aparecen
- Verifica que `<MessageProvider />` esté agregado en tu App
- Asegúrate de importar los estilos `messaging-system.css`

### Los modales no tienen z-index correcto
- Revisa que las variables CSS estén definidas en `tokens.css`:
  ```css
  --z-modal: 1050;
  --z-tooltip: 1070;
  ```

### Las animaciones no funcionan
- Verifica que el archivo `messaging-system.css` esté cargado
- Asegúrate de no tener conflictos con otros archivos CSS

## 📝 Notas de Diseño

- **Familia visual**: Todos los componentes comparten la misma familia de estilos
- **Accesibilidad**: ARIA labels y roles implementados
- **Responsive**: Optimizado para móviles
- **Dark mode ready**: Preparado para modo oscuro (usa variables CSS)
- **Performance**: Animaciones con GPU acceleration

## 🔗 Referencias

- [Radix UI](https://www.radix-ui.com/) - Base para Dialog
- [Lucide Icons](https://lucide.dev/) - Iconos consistentes
- [Design Tokens](./tokens.css) - Variables de diseño MOA
