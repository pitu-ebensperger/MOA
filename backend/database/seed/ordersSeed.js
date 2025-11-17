import pool from "../config.js";
import { ORDERS } from "./ordersData.js";
import { ordersDb } from "../../../frontend/src/mocks/database/orders.js";
import { customersDb } from "../../../frontend/src/mocks/database/customers.js";

const PAYMENT_STATUS_MAP = {
  captured: "pagado",
  pending: "pendiente",
  processing: "procesando",
  failed: "fallido",
};

const SHIPPING_STATUS_MAP = {
  delivered: "entregado",
  in_transit: "en_transito",
  processing: "enviado",
  preparing: "preparacion",
  cancelled: "devuelto",
};

const addressMap = new Map(customersDb.addresses.map((addr) => [addr.id, addr]));
const paymentMap = new Map(ordersDb.payments.map((payment) => [payment.id, payment]));
const shippingMap = new Map(ordersDb.shipping.map((shipping) => [shipping.id, shipping]));

const addDays = (value, days) => {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

async function seedOrders() {
  try {
    for (const order of ORDERS) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [order.userId]
      );

      if (!userRes.rowCount) {
        console.warn(`Usuario '${order.userId}' no encontrado para la orden '${order.orderCode}'`);
        continue;
      }

      const usuarioId = userRes.rows[0].usuario_id;
      const addressInfo = addressMap.get(order.addressId);
      const addressRes = addressInfo
        ? await pool.query(
            `
            SELECT direccion_id FROM direcciones
              WHERE usuario_id = $1 AND etiqueta = $2 AND calle = $3
          `,
            [usuarioId, addressInfo.label, addressInfo.street]
          )
        : null;

      if (!addressRes?.rowCount) {
        console.warn(`Dirección '${order.addressId}' no encontrada para orden '${order.orderCode}'`);
        continue;
      }

      const direccionId = addressRes.rows[0].direccion_id;
      const paymentRes = await pool.query(
        "SELECT metodo_pago_id FROM metodos_pago WHERE token_externo = $1",
        [order.paymentId]
      );

      if (!paymentRes.rowCount) {
        console.warn(`Método de pago '${order.paymentId}' no encontrado para orden '${order.orderCode}'`);
        continue;
      }

      const metodoPagoId = paymentRes.rows[0].metodo_pago_id;
      const payment = paymentMap.get(order.paymentId);
      const shipping = shippingMap.get(order.shipmentId);

      const statusKey = payment?.status?.toLowerCase() ?? "pending";
      const estadoPago = PAYMENT_STATUS_MAP[statusKey] ?? "pendiente";
      const shippingKey = shipping?.status ?? "preparing";
      const estadoEnvio = SHIPPING_STATUS_MAP[shippingKey] ?? "preparacion";

      const fechaEnvio = shipping?.shippedAt ?? order.createdAt;
      const fechaEntregaReal = shipping?.deliveredAt ?? null;
      const fechaEntregaEstimada = addDays(fechaEnvio, 3);

      const sql = `
        INSERT INTO ordenes (
          order_code, usuario_id, total_cents, subtotal_cents,
          envio_cents, impuestos_cents, direccion_id, metodo_pago_id,
          estado_pago, estado_envio, metodo_pago_usado, metodo_despacho,
          fecha_pago, transaccion_id, fecha_envio, fecha_entrega_estimada,
          fecha_entrega_real, numero_seguimiento, empresa_envio,
          notas_cliente, notas_internas
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19,
          NULL, NULL
        )
        ON CONFLICT (order_code) DO UPDATE SET
          total_cents = EXCLUDED.total_cents,
          subtotal_cents = EXCLUDED.subtotal_cents,
          envio_cents = EXCLUDED.envio_cents,
          impuestos_cents = EXCLUDED.impuestos_cents,
          direccion_id = EXCLUDED.direccion_id,
          metodo_pago_id = EXCLUDED.metodo_pago_id,
          estado_pago = EXCLUDED.estado_pago,
          estado_envio = EXCLUDED.estado_envio,
          metodo_pago_usado = EXCLUDED.metodo_pago_usado,
          metodo_despacho = EXCLUDED.metodo_despacho,
          fecha_pago = EXCLUDED.fecha_pago,
          transaccion_id = EXCLUDED.transaccion_id,
          fecha_envio = EXCLUDED.fecha_envio,
          fecha_entrega_estimada = EXCLUDED.fecha_entrega_estimada,
          fecha_entrega_real = EXCLUDED.fecha_entrega_real,
          numero_seguimiento = EXCLUDED.numero_seguimiento,
          empresa_envio = EXCLUDED.empresa_envio
      `;

      const values = [
        order.orderCode,
        usuarioId,
        order.total,
        order.subtotal,
        order.envio,
        order.impuestos,
        direccionId,
        metodoPagoId,
        estadoPago,
        estadoEnvio,
        payment?.provider ?? "Webpay Plus",
        "standard",
        payment?.processedAt,
        payment?.authorizationCode,
        fechaEnvio,
        fechaEntregaEstimada,
        fechaEntregaReal,
        shipping?.trackingNumero ?? null,
        shipping?.carrier ?? null,
      ];

      await pool.query(sql, values);
    }

    console.log("Órdenes sincronizadas");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar órdenes:", error);
    process.exit(1);
  }
}

seedOrders();
