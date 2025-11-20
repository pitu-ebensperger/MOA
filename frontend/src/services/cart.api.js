import { apiClient } from '@/services/api-client.js'

/**
import { apiClient } from "./api-client.js";

export const cartApi = {
  async getCart() {
    return apiClient.private.get("/cart");
  },

  async addToCart(productId, cantidad = 1) {
    return apiClient.private.post("/cart/add", {
      producto_id: productId,
      cantidad,
    });
  },

  async removeFromCart(productId) {
    return apiClient.private.delete(`/cart/remove/${productId}`);
  },

  async updateQuantity(productId, cantidad) {
    return apiClient.private.patch("/cart/update", {
      producto_id: productId,
      cantidad,
    });
  },

  async clearCart() {
    return apiClient.private.delete("/cart/clear");
  },
};
 */
export const cartApi = {
  /*GET /cart*/
  get: async () => {
    try {
      const response = await apiClient.private.get('/cart')
      return response?.data || response
    } catch (error) {
      console.error('Error obteniendo carrito:', error)
      throw error
    }
  },

  /**POST /cart/add
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad (default: 1)
   */
  add: async (productId, quantity = 1) => {
    try {
      const response = await apiClient.private.post('/cart/add', {
        producto_id: productId,
        cantidad: quantity
      })
      return response?.data || response
    } catch (error) {
      console.error('Error agregando al carrito:', error)
      throw error
    }
  },

  /** DELETE /cart/remove/:productId
   * @param {number} productId - ID del producto a eliminar
   */
  remove: async (productId) => {
    try {
      const response = await apiClient.private.delete(`/cart/remove/${productId}`)
      return response?.data || response
    } catch (error) {
      console.error('Error eliminando del carrito:', error)
      throw error
    }
  },

  /*DELETE /cart/clear */
  clear: async () => {
    try {
      const response = await apiClient.private.delete('/cart/clear')
      return response?.data || response
    } catch (error) {
      console.error('Error vaciando carrito:', error)
      throw error
    }
  },

  /**
   * Actualizar cantidad de un item (implementado via remove + add)
   * @param {number} productId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   */
  updateQuantity: async (productId, newQuantity) => {
    try {
      // Primero eliminar el item
      await cartApi.remove(productId)
      // Luego agregarlo con la nueva cantidad
      if (newQuantity > 0) {
        return await cartApi.add(productId, newQuantity)
      }
      return { success: true, message: 'Item eliminado' }
    } catch (error) {
      console.error('Error actualizando cantidad:', error)
      throw error
    }
  }
}

// Exports individuales opcionales
export const getCart = cartApi.get
export const addToCart = cartApi.add
export const removeFromCart = cartApi.remove
export const clearCart = cartApi.clear
export const updateCartItemQuantity = cartApi.updateQuantity
