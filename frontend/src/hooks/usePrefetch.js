import { useCallback } from 'react'

/**
 * Hook para precargar componentes lazy antes de la navegación
 * Útil para mejorar la percepción de velocidad al hacer hover en links
 * 
 * @example
 * const prefetch = usePrefetch()
 * 
 * <Link 
 *   to="/products" 
 *   onMouseEnter={() => prefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))}
 * >
 *   Productos
 * </Link>
 */
export const usePrefetch = () => {
  const prefetchedModules = new Set()

  const prefetch = useCallback((importFn) => {
    const moduleKey = importFn.toString()
    
    // Evitar cargar el mismo módulo múltiples veces
    if (prefetchedModules.has(moduleKey)) {
      return
    }

    prefetchedModules.add(moduleKey)
    
    // Precargar el módulo
    importFn().catch((error) => {
      console.warn('Error precargando módulo:', error)
      prefetchedModules.delete(moduleKey)
    })
  }, [])

  return prefetch
}
