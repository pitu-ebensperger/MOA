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
    },
  },
})

// 🚨 LIMPIEZA DE EMERGENCIA: Ctrl+Shift+X para limpiar overlays trabados
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
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
      allFixed.forEach(el => {
        console.log('Removiendo:', el.className);
        el.remove();
      });
      
      // Remover portales de Radix
      document.querySelectorAll('[data-radix-portal]').forEach(p => p.remove());
      
      // Remover overlays con z-index alto
      const highZ = Array.from(document.querySelectorAll('div')).filter(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        return !isNaN(zIndex) && parseInt(zIndex) > 40;
      });
      highZ.forEach(el => {
        console.log('Removiendo z-index alto:', el.className, 'z-index:', window.getComputedStyle(el).zIndex);
        el.remove();
      });
      
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
