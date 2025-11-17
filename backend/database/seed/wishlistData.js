import { customersDb } from "../../../frontend/src/mocks/database/customers.js";

const WISHLIST_PRODUCT_MAP = {
  201: "sofa-modular-arena",
  103: "mesa-natural-maciza",
  102: "velador-rustico",
};

export const WISHLISTS = customersDb.wishlists.map((list) => ({
  id: list.id,
  userId: list.userId,
  nombre: list.name,
  updatedAt: list.updatedAt,
}));

export const WISHLIST_ITEMS = customersDb.wishlists
  .flatMap((list) =>
    list.productIds.map((productId) => ({
      wishlistId: list.id,
      productSlug: WISHLIST_PRODUCT_MAP[productId],
    }))
  )
  .filter((item) => Boolean(item.productSlug));
