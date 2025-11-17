import {
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} from "../models/cartModel.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getCartItems(userId);

    return res.json({
      cart_id: result.cart_id,
      items: result.items,
    });
  } catch (error) {
    console.error("Error en getCart:", error);
    return res.status(500).json({ error: "Error al obtener el carrito" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { producto_id, cantidad = 1 } = req.body;

    if (!producto_id) {
      return res.status(400).json({ error: "Falta producto_id" });
    }

    const item = await addItemToCart(userId, producto_id, cantidad);

    return res.status(201).json({ item });
  } catch (error) {
    console.error("Error en addToCart:", error);
    return res.status(500).json({ error: "Error al agregar producto" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Falta productId" });
    }

    const removed = await removeItemFromCart(userId, productId);

    return res.json({
      message: "Producto eliminado",
      removed,
    });
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    return res.status(500).json({ error: "Error al eliminar producto" });
  }
};

export const emptyCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await clearCart(userId);

    return res.json({ message: "Carrito vaciado" });
  } catch (error) {
    console.error("Error en emptyCart:", error);
    return res.status(500).json({ error: "Error al vaciar carrito" });
  }
};
