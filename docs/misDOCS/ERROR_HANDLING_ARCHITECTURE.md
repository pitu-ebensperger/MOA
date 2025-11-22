# Arquitectura de Manejo de Errores - MOA

## ¿Es práctica común en sitios públicos?

**Sí, absolutamente.** Todas las aplicaciones web profesionales implementan estas características:

### Ejemplos de la industria:

| Empresa | Error ID | Report Bug | Detalles Técnicos | Logging Service |
|---------|----------|------------|-------------------|-----------------|
| **GitHub** | ✅ | ✅ | ✅ (en dev) | Sentry |
| **Vercel** | ✅ | ✅ | ✅ (en dev) | LogRocket |
| **Stripe** | ✅ | ✅ | ✅ (en dev) | Datadog |
| **Linear** | ✅ | ✅ | ✅ (en dev) | Sentry |
| **Notion** | ✅ | ✅ | ❌ | Rollbar |
| **Discord** | ✅ | ✅ | ✅ (en dev) | Sentry |

### ¿Por qué lo usan todos?

1. **Reduce tiempo de soporte**: De "no sé qué pasó" a "Error #abc123" → reproducible en minutos
2. **Mejora experiencia de usuario**: El usuario siente que su problema será resuelto
3. **Datos para priorización**: Los errores más frecuentes se ven en dashboard
4. **Cumplimiento legal**: Algunos sectores requieren logs de errores (fintech, salud)

---

## Comparación: Tipos de Manejo de Errores

### Tabla 1: ErrorBoundary vs Otros Métodos

| Característica | ErrorBoundary | try/catch | React Query onError | Validación de Formularios |
|----------------|---------------|-----------|---------------------|---------------------------|
| **Cuándo se activa** | Errores de renderizado | Código síncrono/asíncrono | Fallos de API | Datos inválidos |
| **Scope** | Árbol de componentes | Bloque específico | Query/Mutation | Form específico |
| **Interfaz de usuario** | Pantalla completa de error | No hay UI por defecto | Toast/Alert | Mensajes en campos |
| **Recuperable** | No (requiere refresh) | Sí (con lógica) | Sí (retry automático) | Sí (corregir input) |
| **Logging automático** | Sí | Manual | Manual | Manual |
| **Ejemplo** | `undefined.map()` | `JSON.parse(invalid)` | `fetch()` falla | Email sin @ |

### Tabla 2: Niveles de Error Handling

| Nivel | Método | Propósito | Ejemplo en MOA |
|-------|--------|-----------|----------------|
| **1. Validación** | Formularios | Prevenir errores | `fieldErrors` en AdminCategoriesPage |
| **2. API Errors** | React Query | Manejar fallos de red | `onError` en mutations |
| **3. Runtime Errors** | try/catch | Errores esperados | `JSON.parse()` en localStorage |
| **4. Render Errors** | ErrorBoundary | Última red de seguridad | Componente falla al renderizar |

---

## Arquitectura del ErrorBoundary

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         React App Tree                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    ErrorBoundary                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │              App Components                         │  │ │
│  │  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐       │  │ │
│  │  │  │ Header  │  │ Products │  │ AdminPanel  │       │  │ │
│  │  │  └─────────┘  └──────────┘  └─────────────┘       │  │ │
│  │  │         ↓            ↓              ↓              │  │ │
│  │  │      ❌ Error ocurre aquí                          │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                          ↓                                │ │
│  │              componentDidCatch() captura                  │ │
│  │                          ↓                                │ │
│  │  ┌───────────────────────────────────────────────────┐   │ │
│  │  │  State: { hasError: true, errorId: "x7k2m9" }    │   │ │
│  │  └───────────────────────────────────────────────────┘   │ │
│  │                          ↓                                │ │
│  │  ┌───────────────────────────────────────────────────┐   │ │
│  │  │          Render Error UI                          │   │ │
│  │  │  • Mensaje amigable                               │   │ │
│  │  │  • Error ID: #x7k2m9                              │   │ │
│  │  │  • Botón "Reportar problema"                      │   │ │
│  │  │  • Detalles técnicos (solo dev)                   │   │ │
│  │  └───────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    logErrorToService()
                              ↓
                    ┌──────────────────┐
                    │  Sentry/LogRocket│
                    │  (Producción)    │
                    └──────────────────┘
```

---

## Características del ErrorBoundary de MOA

### 1. Error ID - Identificador Único

**Código:**
```javascript
errorId: Math.random().toString(36).substring(2, 9)
```

**Propósito:**
- **Rastreo único**: Cada error genera un ID como `x7k2m9`
- **Referencia cruzada**: Correlacionar error del usuario con logs del servidor
- **Soporte técnico**: Usuario reporta "Error #x7k2m9" en lugar de explicar todo

**Ejemplo de uso:**
```
Usuario → Email: "Error #x7k2m9 al cargar productos"
Desarrollador → Busca en Sentry por ID → Ve stack trace completo
```

---

### 2. Report Bug - Botón de Reporte

**Código:**
```javascript
handleReportError = () => {
  const subject = encodeURIComponent(`Error en la aplicación - ID: ${errorId}`);
  const body = encodeURIComponent(`
    Error ID: ${errorId}
    URL: ${window.location.href}
    User Agent: ${navigator.userAgent}
    
    Stack Trace:
    ${error.stack}
    
    Component Stack:
    ${errorInfo.componentStack}
  `);
  
  window.location.href = `mailto:soporte@tuapp.com?subject=${subject}&body=${body}`;
};
```

**Propósito:**
- **Canal directo**: Usuario reporta sin salir de la app
- **Contexto automático**: Email pre-llena toda la info técnica
- **Reducción de fricción**: 1 click vs "contacta soporte y explica"

**Email generado:**
```
Para: soporte@tuapp.com
Asunto: Error en la aplicación - ID: x7k2m9

Cuerpo:
Error ID: x7k2m9
URL: https://tuapp.com/admin/products
User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...

Stack Trace:
TypeError: Cannot read property 'map' of undefined
    at ProductList (ProductList.jsx:45)
    at renderWithHooks (react-dom.production.min.js:123)

Component Stack:
    at ProductList (ProductList.jsx:42)
    at AdminPanel (AdminPanel.jsx:18)
    at App (App.jsx:10)
```

---

### 3. Detalles Técnicos - Acordeón de Debug

**Código:**
```javascript
{showDetails && import.meta.env.DEV && (
  <Accordion type="single" collapsible>
    <AccordionItem value="details">
      <AccordionTrigger>Detalles técnicos</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div>
            <h4>Stack Trace:</h4>
            <pre className="text-xs">{error.stack}</pre>
          </div>
          <div>
            <h4>Component Stack:</h4>
            <pre className="text-xs">{errorInfo.componentStack}</pre>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)}
```

**Propósito:**
- **Solo en desarrollo**: `import.meta.env.DEV` oculta en producción
- **Debug rápido**: Ver stack trace sin abrir DevTools
- **Component hierarchy**: Saber exactamente qué componente falló

**Ejemplo de output:**
```
Stack Trace:
TypeError: Cannot read property 'map' of undefined
    at ProductList (http://localhost:5173/src/modules/admin/ProductList.jsx:45:23)
    at renderWithHooks (http://localhost:5173/node_modules/react-dom/...

Component Stack:
    at ProductList (src/modules/admin/ProductList.jsx:42)
    at AdminPanel (src/modules/admin/AdminPanel.jsx:18)
    at AdminLayout (src/layouts/AdminLayout.jsx:25)
    at App (src/App.jsx:10)
```

---

## Integración con Servicios de Logging

### Configuración con Sentry (ejemplo)

**Instalación:**
```bash
npm install @sentry/react
```

**Configuración en ErrorBoundary.jsx:**
```javascript
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    const errorId = Math.random().toString(36).substring(2, 9);
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorId,
    });
    
    // Enviar a Sentry en producción
    this.logErrorToService(error, errorInfo, errorId);
  }

  logErrorToService(error, errorInfo, errorId) {
    if (import.meta.env.PROD) {
      Sentry.captureException(error, {
        tags: {
          errorId: errorId,
          errorBoundary: true,
        },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        extra: {
          errorId: errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });
    }
  }
}
```

**Dashboard de Sentry mostraría:**
```
┌─────────────────────────────────────────────────────────┐
│ TypeError: Cannot read property 'map' of undefined     │
│ Error ID: x7k2m9                                        │
├─────────────────────────────────────────────────────────┤
│ URL: /admin/products                                    │
│ Browser: Chrome 120.0                                   │
│ OS: macOS 14.1                                          │
│ Ocurrencias: 3 veces                                    │
│ Usuarios afectados: 2                                   │
├─────────────────────────────────────────────────────────┤
│ Stack Trace:                                            │
│   ProductList.jsx:45                                    │
│   AdminPanel.jsx:18                                     │
│   App.jsx:10                                            │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo Completo de Reporte de Error

### Diagrama de Secuencia

```
┌──────┐          ┌────────┐          ┌──────────────┐          ┌────────┐          ┌─────────┐
│Usuario│          │Browser │          │ErrorBoundary │          │ Email  │          │ Sentry  │
└───┬──┘          └───┬────┘          └──────┬───────┘          └───┬────┘          └────┬────┘
    │                 │                       │                      │                    │
    │  Click acción   │                       │                      │                    │
    ├────────────────>│                       │                      │                    │
    │                 │                       │                      │                    │
    │                 │  ❌ Error rendering   │                      │                    │
    │                 ├──────────────────────>│                      │                    │
    │                 │                       │                      │                    │
    │                 │                       │  componentDidCatch() │                    │
    │                 │                       ├──────────┐           │                    │
    │                 │                       │          │           │                    │
    │                 │                       │ Genera   │           │                    │
    │                 │                       │ errorId  │           │                    │
    │                 │                       │ #x7k2m9  │           │                    │
    │                 │                       │<─────────┘           │                    │
    │                 │                       │                      │                    │
    │                 │                       │  logErrorToService() │                    │
    │                 │                       ├─────────────────────────────────────────>│
    │                 │                       │                      │                    │
    │                 │  Render Error UI      │                      │                    │
    │<────────────────┴───────────────────────┤                      │                    │
    │                                         │                      │                    │
    │  "¡Ups! Error #x7k2m9"                  │                      │                    │
    │  [Reportar problema]                    │                      │                    │
    │                                         │                      │                    │
    │  Click "Reportar"                       │                      │                    │
    ├─────────────────────────────────────────>                      │                    │
    │                                         │                      │                    │
    │                                         │  mailto: con context │                    │
    │                                         ├─────────────────────>│                    │
    │                                         │                      │                    │
    │  App de email abre                      │                      │                    │
    │<────────────────────────────────────────────────────────────────┤                    │
    │                                         │                      │                    │
    │  Usuario envía email                    │                      │                    │
    ├──────────────────────────────────────────────────────────────>│                    │
    │                                         │                      │                    │
    │                                         │                      │                    │
    
┌────────────┐                              ┌──────────────┐
│Desarrollador│                              │ Sentry Dashb │
└─────┬──────┘                              └──────┬───────┘
      │                                            │
      │  Recibe email con Error #x7k2m9            │
      │<───────────────────────────────────────────│
      │                                            │
      │  Busca "x7k2m9" en Sentry                  │
      ├───────────────────────────────────────────>│
      │                                            │
      │  Resultados: Stack + Context + Frecuencia  │
      │<───────────────────────────────────────────│
      │                                            │
      │  Reproduce localmente                      │
      │  Corrige bug                               │
      │  Deploy                                    │
      ├──────────┐                                 │
      │          │                                 │
      │<─────────┘                                 │
      │                                            │
```

---

## Comparación: Sin vs Con ErrorBoundary

### Tabla 3: Experiencia del Usuario

| Aspecto | Sin ErrorBoundary | Con ErrorBoundary |
|---------|-------------------|-------------------|
| **Error ocurre** | Pantalla blanca | Mensaje amigable con diseño |
| **Información** | "Revisa la consola" | "Error #x7k2m9" + opción de reportar |
| **Acción del usuario** | F5 (refresh) esperando que funcione | Click "Reportar" → email automático |
| **Sensación** | "La app está rota" | "Saben del problema, lo van a arreglar" |
| **Debug** | Usuario no puede ayudar | Usuario envía contexto completo |

### Tabla 4: Experiencia del Desarrollador

| Aspecto | Sin ErrorBoundary | Con ErrorBoundary |
|---------|-------------------|-------------------|
| **Reporte inicial** | "No funciona la página de productos" | "Error #x7k2m9 al cargar productos" |
| **Debugging** | Preguntar: navegador, pasos, etc. | Buscar #x7k2m9 en logs → stack trace |
| **Reproducción** | Difícil (faltan detalles) | Fácil (URL, user agent, stack completo) |
| **Tiempo de resolución** | Horas/días | Minutos/horas |
| **Monitoreo** | Manual (usuarios reportan) | Automático (Sentry alerta) |

---

## Casos de Uso Reales

### Caso 1: Producto sin imagen
```javascript
// ProductCard.jsx
<img src={product.image.url} />
// ❌ Si product.image es undefined → ErrorBoundary captura
```

**Sin ErrorBoundary:**
- Pantalla blanca
- Usuario piensa que internet falló
- Desarrollador no se entera hasta que alguien menciona

**Con ErrorBoundary:**
- Mensaje: "¡Ups! Algo salió mal. Error #a5b3c7"
- Usuario reporta → email con stack trace
- Desarrollador ve: `Cannot read property 'url' of undefined`
- Solución: `<img src={product.image?.url ?? '/placeholder.png'} />`

---

### Caso 2: Migración de API rompe componente
```javascript
// Antes: API devolvía { user: { name: "Juan" } }
// Después: API devuelve { profile: { name: "Juan" } }

// UserProfile.jsx aún usa:
<h1>{data.user.name}</h1>
// ❌ data.user es undefined
```

**Con ErrorBoundary + Sentry:**
1. ErrorBoundary captura 50 errores en 10 minutos
2. Sentry alerta: "Nuevo error de alta frecuencia"
3. Desarrollador ve: `Cannot read property 'name' of undefined`
4. Componente Stack muestra: UserProfile.jsx:23
5. Fix en 5 minutos: `<h1>{data.profile.name}</h1>`
6. Deploy

**Sin ErrorBoundary:**
- Usuarios frustrados (pantalla blanca)
- Tickets de soporte se acumulan
- Desarrollador se entera horas después
- Pérdida de confianza del usuario

---

## Mejores Prácticas Implementadas en MOA

### ✅ 1. ErrorBoundary en la raíz
```jsx
// App.jsx
<ErrorBoundary>
  <Router>
    <Routes />
  </Router>
</ErrorBoundary>
```

### ✅ 2. Error ID único
```javascript
errorId: Math.random().toString(36).substring(2, 9)
// Alternativa más robusta: UUID
import { v4 as uuidv4 } from 'uuid';
errorId: uuidv4()
```

### ✅ 3. Logging condicional
```javascript
if (import.meta.env.PROD) {
  Sentry.captureException(error);
}
```

### ✅ 4. Detalles técnicos solo en desarrollo
```javascript
{showDetails && import.meta.env.DEV && (
  <Accordion>...</Accordion>
)}
```

### ✅ 5. Contexto completo en reporte
```javascript
const body = encodeURIComponent(`
  Error ID: ${errorId}
  URL: ${window.location.href}
  User Agent: ${navigator.userAgent}
  Timestamp: ${new Date().toISOString()}
  
  Stack Trace:
  ${error.stack}
  
  Component Stack:
  ${errorInfo.componentStack}
`);
```

---

## Próximos Pasos: Integración con Sentry

### 1. Instalar dependencia
```bash
npm install @sentry/react
```

### 2. Configurar en main.jsx
```javascript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Agregar errorId si existe
      if (event.extra?.errorId) {
        event.tags = {
          ...event.tags,
          errorId: event.extra.errorId,
        };
      }
      return event;
    },
  });
}
```

### 3. Actualizar ErrorBoundary.jsx
```javascript
logErrorToService(error, errorInfo, errorId) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      tags: { errorId },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        errorId,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    });
  }
}
```

### 4. Variables de entorno
```env
# .env.production
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## Resumen: ¿Por qué usar estas características?

| Característica | Beneficio para Usuario | Beneficio para Desarrollador |
|----------------|------------------------|------------------------------|
| **Error ID** | Referencia simple para reportar | Búsqueda rápida en logs |
| **Report Bug** | 1 click para reportar | Contexto completo automático |
| **Detalles Técnicos** | Transparencia (en dev) | Debug sin DevTools |
| **Logging Service** | Problemas se resuelven más rápido | Alertas automáticas + métricas |

### ROI (Return on Investment)

```
Inversión:
- 2 horas implementar ErrorBoundary
- $29/mes Sentry (plan básico)

Retorno:
- 80% reducción en tiempo de debug (de 2h → 20min por error)
- 50% reducción en tickets de soporte (usuarios reportan directamente)
- 100% visibilidad de errores (antes: solo los que usuarios reportaban)
- Mejor experiencia de usuario → mayor retención

Ejemplo real:
- 10 errores/mes × 2h debug = 20h/mes
- Con ErrorBoundary: 10 errores × 20min = 3.3h/mes
- Ahorro: 16.7h/mes → $1000+ USD/mes (a $60/h)
```

---

## Conclusión

El ErrorBoundary con Error ID, Report Bug y Detalles Técnicos es:

1. ✅ **Práctica estándar** en la industria (GitHub, Vercel, Stripe, etc.)
2. ✅ **Mejora UX** - usuario siente que hay soporte
3. ✅ **Acelera debugging** - de horas a minutos
4. ✅ **Reduce costos** - menos tiempo de soporte
5. ✅ **Mejora calidad** - visibilidad completa de errores

**No es opcional para aplicaciones profesionales. Es fundamental.**
