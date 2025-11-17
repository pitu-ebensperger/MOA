import { apiClient } from './api-client.js';

export const wishlistApi = {
  // GET /wishlist - Obtener wishlist del usuario autenticado
  async getWishlist() {
    const data = await apiClient.private.get('/wishlist');
    return data;
  },

  // POST /wishlist/add - Agregar producto a wishlist
  async addToWishlist(productId) {
    const data = await apiClient.private.post('/wishlist/add', { productId });
    return data;
  },

  // DELETE /wishlist/remove/:productId - Remover producto de wishlist
  async removeFromWishlist(productId) {
    const data = await apiClient.private.delete(`/wishlist/remove/${productId}`);
    return data;
  }
};