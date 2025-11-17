import { apiClient } from '@/services/api-client.js'

/**
 * Wishlist API Service
 * Gestión de la lista de deseos
 */
export const wishlistApi = {
  /**
   * Obtener wishlist del usuario autenticado
   * GET /wishlist
   */
  get: async () => {
    try {
      const response = await apiClient.private.get('/wishlist')
      return response?.data || response
    } catch (error) {
      console.error('Error obteniendo wishlist:', error)
      throw error
    }
  },

  /**
   * Agregar producto a la wishlist
   * POST /wishlist/add
   * @param {number} productId - ID del producto
   */
  add: async (productId) => {
    try {
      const response = await apiClient.private.post('/wishlist/add', {
        producto_id: productId
      })
      return response?.data || response
    } catch (error) {
      console.error('Error agregando a wishlist:', error)
      throw error
    }
  },

  /**
   * Quitar producto de la wishlist
   * DELETE /wishlist/remove/:productId
   * @param {number} productId - ID del producto a eliminar
   */
  remove: async (productId) => {
    try {
      const response = await apiClient.private.delete(`/wishlist/remove/${productId}`)
      return response?.data || response
    } catch (error) {
      console.error('Error eliminando de wishlist:', error)
      throw error
    }
  },

  /**
   * Verificar si un producto está en la wishlist
   * (Implementado del lado cliente comparando con la lista completa)
   * @param {number} productId - ID del producto a verificar
   */
  contains: async (productId) => {
    try {
      const data = await wishlistApi.get()
      const items = data?.items || []
      return items.some(item => 
        item.producto_id === productId || item.id === productId
      )
    } catch (error) {
      console.error('Error verificando wishlist:', error)
      return false
    }
  },

  /**
   * Toggle producto en wishlist (agregar si no está, quitar si está)
   * @param {number} productId - ID del producto
   */
  toggle: async (productId) => {
    try {
      const isInWishlist = await wishlistApi.contains(productId)
      
      if (isInWishlist) {
        return await wishlistApi.remove(productId)
      } else {
        return await wishlistApi.add(productId)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      throw error
    }
  }
}

// Exports individuales opcionales
export const getWishlist = wishlistApi.get
export const addToWishlist = wishlistApi.add
export const removeFromWishlist = wishlistApi.remove
export const isInWishlist = wishlistApi.contains
export const toggleWishlist = wishlistApi.toggle
