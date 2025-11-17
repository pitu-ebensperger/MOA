# 🎯 Estrategia: Direcciones y Seguimiento de Envíos

## 📍 PARTE 1: CUÁNDO CAPTURAR DIRECCIONES

### ✅ **Enfoque Recomendado: Captura Progresiva**

```
┌─────────────┐
│  REGISTRO   │ → Solo: email + contraseña + nombre
└──────┬──────┘   (Formulario mínimo, menos fricción)
       │
       ▼
┌─────────────┐
│   COMPRA    │ → Capturar dirección + checkbox "Guardar para próximas compras"
└──────┬──────┘   (Momento natural de pedir dirección)
       │
       ▼
┌─────────────┐
│   PERFIL    │ → Gestionar direcciones guardadas
└─────────────┘   (Editar, agregar, eliminar)
```

### 🎨 **Implementación en CheckoutPage**

**Escenario 1: Usuario nuevo / Sin direcciones guardadas**
```jsx
// CheckoutPage.jsx
export const CheckoutPage = () => {
  const { addresses } = useAddresses();
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressMode, setAddressMode] = useState(
    addresses.length > 0 ? 'select' : 'new'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dirección de envío</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length > 0 && (
          <div className="mb-4">
            <Label>Usar dirección guardada</Label>
            <RadioGroup value={addressMode} onValueChange={setAddressMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="select" />
                <Label htmlFor="select">Seleccionar dirección guardada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Usar nueva dirección</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {addressMode === 'select' ? (
          <AddressSelector />
        ) : (
          <>
            <AddressForm />
            
            {/* Checkbox para guardar dirección */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="saveAddress" className="cursor-pointer text-sm">
                💾 Guardar esta dirección en mi perfil para próximas compras
              </Label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 🚚 PARTE 2: OPCIONES DE DESPACHO Y TRACKING

### 📦 **Métodos de Despacho con Precio y Tiempos Reales**

```javascript
// Configuración de métodos de despacho
const METODOS_DESPACHO = {
  standard: {
    value: "standard",
    label: "Despacho estándar",
    descripcion: "Entrega en 3-5 días hábiles",
    precio: 0, // Gratis
    dias_min: 3,
    dias_max: 5,
    icono: Truck
  },
  express: {
    value: "express",
    label: "Despacho express",
    descripcion: "Entrega en 1-2 días hábiles",
    precio: 6900,
    dias_min: 1,
    dias_max: 2,
    icono: Zap
  },
  retiro: {
    value: "retiro",
    label: "Retiro en showroom",
    descripcion: "Disponible al día siguiente",
    precio: 0,
    dias_min: 1,
    dias_max: 1,
    direccion: "Av. Nueva Providencia 1881, Providencia", // Dirección de tu showroom
    horario: "Lunes a viernes 10:00 - 18:00",
    icono: Store
  }
};
```

### ✅ **Sistema de Tracking Basado en Tiempos Estimados**

### **Estados de Orden con Fechas Estimadas Calculadas** (RECOMENDADO)

```jsx
// utils/orderTracking.js

/**
 * Calcula la fecha estimada de entrega basada en el método de despacho
 */
export function calcularFechaEstimada(fechaOrden, metodoDespacho) {
  const metodo = METODOS_DESPACHO[metodoDespacho];
  if (!metodo) return null;

  const fecha = new Date(fechaOrden);
  
  // Agregar días hábiles (excluyendo fines de semana)
  let diasAgregados = 0;
  while (diasAgregados < metodo.dias_max) {
    fecha.setDate(fecha.getDate() + 1);
    
    // Si no es fin de semana, contar como día hábil
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasAgregados++;
    }
  }
  
  return fecha;
}

/**
 * Calcula el estado actual basado en fechas
 */
export function calcularEstadoActual(orden) {
  const ahora = new Date();
  const fechaOrden = new Date(orden.creado_en);
  const fechaEstimada = calcularFechaEstimada(fechaOrden, orden.metodo_despacho);
  
  // Si está marcado como entregado manualmente
  if (orden.estado_envio === 'entregado') {
    return 'entregado';
  }
  
  // Si está en proceso de preparación (primeras 24h)
  const horasDesdeOrden = (ahora - fechaOrden) / (1000 * 60 * 60);
  if (horasDesdeOrden < 24) {
    return 'confirmada';
  }
  
  // Si está entre 24h y 48h -> en preparación
  if (horasDesdeOrden < 48) {
    return 'preparacion';
  }
  
  // Si ya pasó el tiempo estimado pero no está marcado como entregado
  if (ahora > fechaEstimada) {
    return 'en_transito'; // Probablemente está en camino
  }
  
  // Si está dentro del rango de entrega
  const diasRestantes = Math.ceil((fechaEstimada - ahora) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 1) {
    return 'en_transito';
  }
  
  return 'preparacion';
}

// OrderStatusTimeline.jsx
const ESTADOS_ORDEN = {
  confirmada: {
    label: "Orden confirmada",
    description: "Hemos recibido tu pedido",
    icon: CheckCircle,
    color: "green",
    progreso: 25
  },
  preparacion: {
    label: "En preparación",
    description: "Estamos seleccionando y empaquetando tus piezas",
    icon: Package,
    color: "blue",
    progreso: 50
  },
  en_transito: {
    label: "En camino",
    description: "Tu pedido está en camino",
    icon: Truck,
    color: "orange",
    progreso: 75
  },
  listo_retiro: {
    label: "Listo para retiro",
    description: "Tu pedido está disponible en nuestro showroom",
    icon: Store,
    color: "purple",
    progreso: 75
  },
  entregado: {
    label: "Entregado",
    description: "Tu pedido fue entregado exitosamente",
    icon: CheckCircle2,
    color: "green",
    progreso: 100
  }
};

export function OrderStatusTimeline({ order }) {
  const estadoActual = calcularEstadoActual(order);
  const fechaEstimada = calcularFechaEstimada(order.creado_en, order.metodo_despacho);
  const metodoDespacho = METODOS_DESPACHO[order.metodo_despacho];
  
  // Determinar qué estados mostrar según el método
  const estadosMostrar = order.metodo_despacho === 'retiro' 
    ? ['confirmada', 'preparacion', 'listo_retiro']
    : ['confirmada', 'preparacion', 'en_transito', 'entregado'];

  return (
    <div className="space-y-6">
      {/* Encabezado con fecha estimada */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Entrega estimada</p>
            <p className="text-2xl font-bold text-primary">
              {fechaEstimada ? formatDate(fechaEstimada) : 'Calculando...'}
            </p>
            <p className="text-sm text-gray-500">{metodoDespacho?.label}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {ESTADOS_ORDEN[estadoActual]?.progreso || 0}%
            </div>
            <p className="text-xs text-gray-500">Completado</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${ESTADOS_ORDEN[estadoActual]?.progreso || 0}%` }}
        />
      </div>
      
      {/* Timeline de estados */}
      <div className="relative">
        {estadosMostrar.map((key, index) => {
          const estado = ESTADOS_ORDEN[key];
          const isActive = key === estadoActual;
          const estadoIndex = estadosMostrar.indexOf(estadoActual);
          const isPast = index < estadoIndex;
          const IconComponent = estado.icon;
          
          return (
            <div key={key} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Línea conectora */}
              {index < estadosMostrar.length - 1 && (
                <div className={`absolute left-5 top-10 h-full w-0.5 transition-colors ${
                  isPast ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
              
              {/* Ícono */}
              <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isActive ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-100' :
                isPast ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                <IconComponent className="h-5 w-5" />
              </div>
              
              {/* Contenido */}
              <div className="flex-1">
                <p className={`font-semibold ${
                  isActive ? 'text-blue-600' : 
                  isPast ? 'text-green-600' : 
                  'text-gray-400'
                }`}>
                  {estado.label}
                  {isActive && <span className="ml-2 text-xs">← Ahora</span>}
                  {isPast && <span className="ml-2 text-xs">✓</span>}
                </p>
                <p className={`text-sm ${
                  isActive ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {estado.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información específica del método de despacho */}
      {order.metodo_despacho === 'retiro' && estadoActual === 'listo_retiro' && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <Store className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">¡Tu pedido está listo!</p>
              <p className="mt-1 text-sm text-purple-700">
                <strong>Dirección:</strong> {metodoDespacho.direccion}
              </p>
              <p className="text-sm text-purple-700">
                <strong>Horario:</strong> {metodoDespacho.horario}
              </p>
              <p className="mt-2 text-xs text-purple-600">
                💡 Recuerda traer tu número de orden: <strong>#{order.order_code}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Información de contacto */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          💬 <strong>¿Dudas sobre tu pedido?</strong>
          <br />
          Escríbenos al WhatsApp: <a href="https://wa.me/56912345678" className="underline">+56 9 1234 5678</a>
          <br />
          O por email: <a href="mailto:hola@moa.cl" className="underline">hola@moa.cl</a>
        </p>
      </div>
    </div>
  );
}

/**
 * Función auxiliar para formatear fecha
 */
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('es-CL', options);
}
```

### **Opción B: Sistema de Notificaciones por Email/WhatsApp**

```jsx
// En lugar de tracking en tiempo real, enviar actualizaciones:

const NOTIFICACIONES = {
  orden_confirmada: {
    canal: ['email', 'whatsapp'],
    mensaje: `¡Gracias por tu compra! 
    
Tu orden #MOA-20241117-0001 ha sido confirmada.
Estamos preparando tus piezas con mucho cuidado.

Te contactaremos en las próximas 24-48 horas para coordinar la entrega.

Equipo MOA`
  },
  
  listo_para_envio: {
    canal: ['email', 'whatsapp'],
    mensaje: `Tu pedido está listo! 🎉
    
¿Cuándo te gustaría recibirlo?
Responde este mensaje con tu preferencia de horario.

Orden: #MOA-20241117-0001`
  },
  
  entregado: {
    canal: ['email'],
    mensaje: `¡Tu pedido ha sido entregado! ✨

Esperamos que disfrutes tus nuevas piezas MOA.
¿Nos compartes una foto de cómo quedaron en tu espacio?

Califícanos: [LINK]`
  }
};
```

### **Opción C: Sistema Interno de Gestión Manual** (Para ti/admin)

```jsx
// AdminOrdersPage.jsx - Vista interna
export function AdminOrderDetail({ order }) {
  const [internalNotes, setInternalNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [customerContact, setCustomerContact] = useState('');

  const handleUpdateStatus = async (newStatus) => {
    await ordersApi.updateOrder(order.id, {
      estado_envio: newStatus,
      fecha_entrega: deliveryDate,
      notas_internas: internalNotes
    });
    
    // Disparar notificación al cliente
    await sendCustomerNotification(order.id, newStatus);
  };

  return (
    <div>
      <h2>Gestión Interna - Orden #{order.order_code}</h2>
      
      {/* Estado actual */}
      <div className="mb-4">
        <Label>Estado actual</Label>
        <Select value={order.estado_envio} onValueChange={handleUpdateStatus}>
          <SelectContent>
            <SelectItem value="preparacion">En preparación</SelectItem>
            <SelectItem value="listo_coordinar">Listo para coordinar</SelectItem>
            <SelectItem value="coordinado">Entrega coordinada</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fecha de entrega coordinada */}
      <div className="mb-4">
        <Label>Fecha de entrega coordinada</Label>
        <Input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>

      {/* Notas internas (NO visibles para el cliente) */}
      <div className="mb-4">
        <Label>Notas internas</Label>
        <Textarea
          placeholder="Ej: Cliente prefiere entrega por la tarde, tocar timbre 2 veces"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={4}
        />
      </div>

      {/* Contacto con cliente */}
      <div className="mb-4">
        <Label>Último contacto</Label>
        <Input
          placeholder="Ej: WhatsApp 15/11 - Confirmó entrega para el sábado"
          value={customerContact}
          onChange={(e) => setCustomerContact(e.target.value)}
        />
      </div>

      <Button onClick={() => handleUpdateStatus(order.estado_envio)}>
        Actualizar y notificar cliente
      </Button>
    </div>
  );
}
```

---

## 🗄️ PARTE 3: AJUSTES EN LA BASE DE DATOS

### **Simplificar campos de tracking**

```sql
-- En lugar de número de tracking ficticio, usar estos campos:

ALTER TABLE ordenes 
    -- Quitar estos campos si no tienes courier real:
    -- ADD COLUMN numero_seguimiento TEXT,
    -- ADD COLUMN empresa_envio TEXT,
    
    -- Usar estos en su lugar:
    ADD COLUMN IF NOT EXISTS fecha_contacto_cliente TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metodo_coordinacion TEXT, -- 'whatsapp', 'email', 'telefono'
    ADD COLUMN IF NOT EXISTS fecha_entrega_coordinada TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ventana_entrega TEXT, -- 'mañana', 'tarde', 'todo el día'
    ADD COLUMN IF NOT EXISTS confirmacion_cliente BOOLEAN DEFAULT FALSE;
```

---

## 📱 PARTE 4: UI/UX PARA EL CLIENTE

### **Vista de Orden del Cliente (Realista)**

```jsx
// OrderDetailPage.jsx
export function OrderDetailPage() {
  const { order } = useOrder();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1>Pedido #{order.order_code}</h1>
      
      {/* Timeline de estados */}
      <OrderStatusTimeline 
        currentStatus={order.estado_envio}
        deliveryDate={order.fecha_entrega_coordinada}
      />

      {/* Productos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.map(item => (
            <ProductLineItem key={item.id} item={item} />
          ))}
        </CardContent>
      </Card>

      {/* Dirección de entrega */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dirección de entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p>{order.direccion.calle} {order.direccion.numero}</p>
              <p>{order.direccion.comuna}, {order.direccion.ciudad}</p>
              <p>{order.direccion.region}, Chile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="mb-3 font-semibold text-blue-900">
            ¿Necesitas hacer cambios o consultar algo?
          </p>
          <div className="space-y-2 text-sm text-blue-800">
            <a 
              href="https://wa.me/56912345678" 
              className="flex items-center gap-2 hover:underline"
            >
              <Phone className="h-4 w-4" />
              WhatsApp: +56 9 1234 5678
            </a>
            <a 
              href="mailto:hola@moa.cl"
              className="flex items-center gap-2 hover:underline"
            >
              <Mail className="h-4 w-4" />
              Email: hola@moa.cl
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎯 RESUMEN DE DECISIONES

### ✅ **Direcciones:**
1. **NO** pedirlas en registro
2. **SÍ** pedirlas en checkout con opción de guardar
3. **SÍ** permitir gestionarlas después en perfil

### ✅ **Tracking:**
1. **NO** mostrar tracking falso de courier
2. **SÍ** mostrar estados internos honestos:
   - Confirmada
   - En preparación
   - Listo para coordinar
   - Entrega coordinada
   - Entregado
3. **SÍ** enfocarse en comunicación directa (WhatsApp/Email)
4. **SÍ** sistema interno de notas para tu equipo

### 📊 **Ventajas de este enfoque:**
- ✅ Transparente y honesto
- ✅ No crea expectativas falsas
- ✅ Se alinea con modelo boutique/curado
- ✅ Permite coordinación personalizada
- ✅ Escalable cuando agregues courier real

---

## 🔄 MIGRACIÓN FUTURA

Cuando tengas courier real:
```sql
-- Simplemente agregar estos campos:
ALTER TABLE ordenes 
    ADD COLUMN numero_seguimiento TEXT,
    ADD COLUMN empresa_envio TEXT,
    ADD COLUMN tracking_url TEXT;

-- Y actualizar UI para mostrarlos
```

---

¿Te parece este enfoque? Es mucho más honesto y alineado con la identidad "boutique" de MOA.
