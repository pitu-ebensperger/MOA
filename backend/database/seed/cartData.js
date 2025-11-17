import { customersDb } from "../../../frontend/src/mocks/database/customers.js";

const CART_PRODUCT_MAP = {
  101: "sofa-modular-arena",
  102: "velador-rustico",
};

export const CARTS = customersDb.carts.map((cart) => ({
  id: cart.id,
  userId: cart.userId,
  currency: cart.currency,
  updatedAt: cart.updatedAt,
}));

export const CART_ITEMS = customersDb.carts
  .flatMap((cart) =>
    cart.items.map((item) => ({
      cartId: cart.id,
      productSlug: CART_PRODUCT_MAP[item.productId],
      cantidad: item.quantity,
      variantId: item.variantId,
    }))
  )
  .filter((item) => Boolean(item.productSlug));
