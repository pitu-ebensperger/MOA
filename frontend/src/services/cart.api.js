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
