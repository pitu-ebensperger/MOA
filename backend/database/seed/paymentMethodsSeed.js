import pool from "../config.js";
import { PAYMENT_METHODS } from "./paymentMethodsData.js";

async function seedPaymentMethods() {
  try {
    const defaultFlag = new Set();

    for (const method of PAYMENT_METHODS) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [method.userId]
      );

      if (!userRes.rowCount) {
        console.warn(`Usuario '${method.userId}' no encontrado para el medio de pago '${method.externalId}'`);
        continue;
      }

      const usuarioId = userRes.rows[0].usuario_id;
      const isDefault = !defaultFlag.has(usuarioId);
      if (isDefault) defaultFlag.add(usuarioId);

      const lastDigits = method.authorizationCode
        ? method.authorizationCode.slice(-4)
        : "0000";

      const statusKey = method.status?.toLowerCase() ?? "pending";
      const estadoPago = paymentStatusMap[statusKey] ?? "pendiente";

      const metadata = {
        cuotas: method.cuotas,
        currency: method.currency,
        ordenReferencia: method.externalId,
      };

      const sql = `
        INSERT INTO metodos_pago (
          usuario_id, tipo, ultimos_digitos, marca, nombre_titular,
          mes_expiracion, anio_expiracion, token_externo, proveedor_pago,
          metadata, es_predeterminado, activo, creado_en, actualizado_en
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, now()), COALESCE($14, now()))
        ON CONFLICT (token_externo) DO UPDATE SET
          tipo = EXCLUDED.tipo,
          marca = EXCLUDED.marca,
          nombre_titular = EXCLUDED.nombre_titular,
          mes_expiracion = EXCLUDED.mes_expiracion,
          anio_expiracion = EXCLUDED.anio_expiracion,
          proveedor_pago = EXCLUDED.proveedor_pago,
          metadata = EXCLUDED.metadata,
          es_predeterminado = EXCLUDED.es_predeterminado,
          activo = EXCLUDED.activo,
          actualizado_en = COALESCE(EXCLUDED.actualizado_en, now())
      `;

      const values = [
        usuarioId,
        "webpay",
        lastDigits,
        "Visa",
        "Cliente MOA",
        method.expirationMonth,
        method.expirationYear,
        method.externalId,
        method.provider,
        metadata,
        isDefault,
        statusKey !== "failed",
        method.processedAt,
        method.processedAt,
      ];

      await pool.query(sql, values);
    }

    console.log("Métodos de pago sincronizados");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar métodos de pago:", error);
    process.exit(1);
  }
}

seedPaymentMethods();
