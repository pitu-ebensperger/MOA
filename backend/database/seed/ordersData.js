import { ordersDb } from "../../../frontend/src/mocks/database/orders.js";

const ORDER_LIMIT = 6;

export const ORDERS = ordersDb.orders.slice(0, ORDER_LIMIT).map((order) => ({
  externalId: order.id,
  orderCode: order.number,
  userId: order.userId,
  addressId: order.addressId,
  paymentId: order.paymentId,
  shipmentId: order.shipmentId,
  subtotal: order.subtotal,
  envio: order.shipping,
  impuestos: order.tax,
  total: order.total,
  currency: order.currency,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
}));
