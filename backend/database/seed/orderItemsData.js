import { ordersDb } from "../../../frontend/src/mocks/database/orders.js";

const ORDER_LIMIT = 6;
const ORDER_ITEM_PRODUCT_MAP = {
  201: "sofa-modular-arena",
  102: "lampara-colgante-globo-opal",
  203: "mesilla-blanca-acentos-madera",
  301: "librero-abierto-madera-clara",
  182: "espejo-redondo-marco-madera",
  401: "mesa-natural-maciza",
};

const targetOrders = ordersDb.orders.slice(0, ORDER_LIMIT);
const orderIdToCode = new Map(targetOrders.map((order) => [order.id, order.number]));

export const ORDER_ITEMS = ordersDb.orderItems
  .filter((item) => orderIdToCode.has(item.orderId))
  .map((item) => ({
    orderCode: orderIdToCode.get(item.orderId),
    productSlug: ORDER_ITEM_PRODUCT_MAP[item.productId],
    quantity: item.quantity,
  }))
  .filter((item) => Boolean(item.productSlug));
