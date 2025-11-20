import { cartsDb } from "@/mocks/database/carts.js"

// Mock Cart API
export const mockCartApi = {
  // GET /cart/:userId
  getCart: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let cart = cartsDb.carts.find((c) => c.userId === userId);

    // Si no existe, crear uno vacío
    if (!cart) {
      cart = {
        id: `cart-${userId}`,
        userId,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      cartsDb.carts.push(cart);
    }

    return cart;
  },

  // POST /cart/:userId/items
  addItem: async (userId, item) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cart = cartsDb.carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    // Verificar si el producto ya existe
    const existingItem = cart.items.find((i) => i.productId === item.productId);

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      cart.items.push({
        id: `cart-item-${Date.now()}`,
        ...item,
        quantity: item.quantity || 1,
      });
    }

    // Recalcular totales
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.tax = Math.round(cart.subtotal * 0.19);
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date().toISOString();

    return cart;
  },

  // PUT /cart/:userId/items/:itemId
  updateItem: async (userId, itemId, quantity) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cart = cartsDb.carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error("Item no encontrado");
    }

    if (quantity <= 0) {
      // Eliminar item
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      item.quantity = quantity;
    }

    // Recalcular totales
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.tax = Math.round(cart.subtotal * 0.19);
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date().toISOString();

    return cart;
  },

  // DELETE /cart/:userId/items/:itemId
  removeItem: async (userId, itemId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cart = cartsDb.carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    cart.items = cart.items.filter((i) => i.id !== itemId);

    // Recalcular totales
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.tax = Math.round(cart.subtotal * 0.19);
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date().toISOString();

    return cart;
  },

  // DELETE /cart/:userId
  clearCart: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cart = cartsDb.carts.find((c) => c.userId === userId);

    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.total = 0;
    cart.updatedAt = new Date().toISOString();

    return cart;
  },
};
