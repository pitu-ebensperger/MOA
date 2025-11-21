import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { handleAuthError } from '@/utils/handleAuthError.js'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from "@/context/AuthContext.jsx"
import { CartProvider } from "@/context/cartContext.jsx"

import { App } from '@/app/App.jsx'
import { MessageProvider } from '@/components/ui'

import '../styles/global.css'
import '../styles/tokens.css'
import '../styles/shadcn-theme.css'
import '../styles/components/buttons.css'
import '../styles/messaging-system.css'

// 🧹 LIMPIEZA INMEDIATA al cargar la app
if (typeof document !== 'undefined' && document.body) {
  document.body.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.body.classList.remove('overflow-hidden');
  console.log('[MOA] Limpieza inicial de overflow del body');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Error handling global
      onError: (error) => {
        console.error('[React Query - Query Error]', error);
        // En producción, enviar a servicio de logging
        if (import.meta.env.PROD) {
          // TODO: Sentry.captureException(error);
        }
      },
      // Configuración de retry
      retry: (failureCount, error) => {
        // No reintentar si es error de autenticación
        if (handleAuthError(error)) return false;
        // No reintentar errores 4xx (errores del cliente)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2; // Máximo 2 reintentos
      },
      // Configuración de cache
      staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
      cacheTime: 10 * 60 * 1000, // 10 minutos - mantener en cache
      // Configuración de refetch
      refetchOnWindowFocus: false, // No refetch al enfocar ventana (puede ser molesto)
      refetchOnReconnect: true, // Sí refetch al reconectar
      refetchOnMount: true, // Refetch al montar componente
      // Performance
      keepPreviousData: true, // Mantener datos previos mientras carga nuevos
    },
    mutations: {
      retry: false, // No reintentar mutations
      onError: (error) => {
        console.error('[React Query - Mutation Error]', error);
        // En producción, enviar a servicio de logging
        if (import.meta.env.PROD) {
          // TODO: Sentry.captureException(error);
        }
      },
    },
  },
})

// 🌐 NETWORK OFFLINE DETECTION
if (typeof globalThis.window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Network] Conexión restaurada');
    // Refetch queries automáticamente
    queryClient.refetchQueries();
  });

  window.addEventListener('offline', () => {
    console.warn('[Network] Sin conexión a internet');
    // Opcional: mostrar toast/banner
  });
}

// 🔇 SUPPRESS CONSOLE ERRORS EN PRODUCCIÓN (solo errores, mantener warns)
if (import.meta.env.PROD && typeof console !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    // Silenciar ciertos errores conocidos/esperados en producción
    const message = args[0]?.toString() || '';
    
    // Lista de errores a silenciar
    const suppressPatterns = [
      'ResizeObserver loop', // Error benigno de ResizeObserver
      'Failed to fetch dynamically imported module', // Ya manejado por ErrorBoundary
    ];
    
    const shouldSuppress = suppressPatterns.some(pattern => message.includes(pattern));
    
    if (!shouldSuppress) {
      // Enviar a servicio de logging en lugar de mostrar en consola
      // TODO: Sentry.captureException(new Error(message));
      // Mientras tanto, log simple sin stack trace
      originalError('[Error]', message);
    }
  };
}

// 🚨 LIMPIEZA DE EMERGENCIA: Ctrl+Shift+X para limpiar overlays trabados
if (typeof globalThis.window !== 'undefined') {
  globalThis.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      console.warn('🚨 LIMPIEZA DE EMERGENCIA ACTIVADA - Removiendo todos los overlays');
      
      // Limpiar body
      if (document.body) {
        document.body.style.overflow = '';
        document.body.style.removeProperty('overflow');
        document.body.classList.remove('overflow-hidden');
      }
      
      // Remover TODOS los elementos con fixed inset-0
      const allFixed = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
      for (const el of allFixed) {
        console.log('Removiendo:', el.className);
        el.remove();
      }
      
      // Remover portales de Radix
      for (const p of document.querySelectorAll('[data-radix-portal]')) {
        p.remove();
      }
      
      // Remover overlays con z-index alto
      const highZ = Array.from(document.querySelectorAll('div')).filter(el => {
        const zIndex = globalThis.getComputedStyle(el).zIndex;
        return !Number.isNaN(Number(zIndex)) && Number.parseInt(zIndex, 10) > 40;
      });
      for (const el of highZ) {
        console.log('Removiendo z-index alto:', el.className, 'z-index:', globalThis.getComputedStyle(el).zIndex);
        el.remove();
      }
      
      alert('✅ Limpieza completada. Presiona F5 para recargar.');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
            <MessageProvider />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
