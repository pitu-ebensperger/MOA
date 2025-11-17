import { ordersDb } from "../../../frontend/src/mocks/database/orders.js";

const ORDER_LIMIT = 10;
const targetOrders = ordersDb.orders.slice(0, ORDER_LIMIT);
const paymentsById = new Map(ordersDb.payments.map((payment) => [payment.id, payment]));

export const PAYMENT_METHODS = targetOrders
  .map((order) => {
    const payment = paymentsById.get(order.paymentId);
    if (!payment) return null;

    const processedAt = payment.processedAt ? new Date(payment.processedAt) : new Date();
    const expirationMonth = ((processedAt.getMonth() + 5) % 12) + 1;
    const expirationYear = processedAt.getFullYear() + 2;

    return {
      externalId: payment.id,
      userId: order.userId,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      processedAt: payment.processedAt,
      authorizationCode: payment.authorizationCode,
      cuotas: payment.cuotas,
      expirationMonth,
      expirationYear,
    };
  })
  .filter(Boolean);
