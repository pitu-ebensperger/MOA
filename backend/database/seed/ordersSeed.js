// Seed histórico de órdenes
import pool from "../config.js";
import { ORDER_HISTORY } from "./ordersData.js";

async function seedOrders() {
  try {
    const emails = [...new Set(ORDER_HISTORY.map((order) => order.email))];
    const slugSet = [
      ...new Set(ORDER_HISTORY.flatMap((order) => order.items.map((item) => item.slug))),
    ];

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );
    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    const { rows: products } = await pool.query(
      `SELECT producto_id, slug, precio_cents FROM productos WHERE slug = ANY($1)`,
      [slugSet],
    );
    const productMap = new Map(products.map((product) => [product.slug, product]));

    if (!products.length) {
      console.error("FATAL: No se encontraron productos en la BD. Ejecuta 'npm run seed:products' primero.");
      process.exit(1);
    }

    for (const order of ORDER_HISTORY) {
      const usuarioId = userMap.get(order.email);
      if (!usuarioId) {
        console.warn(`Usuario no encontrado para orden ${order.order_code}: ${order.email}`);
        continue;
      }

      const addressResult = await pool.query(
        `SELECT direccion_id FROM direcciones WHERE usuario_id = $1 ORDER BY es_predeterminada DESC NULLS LAST LIMIT 1`,
        [usuarioId],
      );
      const direccionId = addressResult.rows[0]?.direccion_id || null;

      const items = [];
      for (const item of order.items) {
        const product = productMap.get(item.slug);
        if (!product) {
          console.warn(`Producto ${item.slug} no encontrado para la orden ${order.order_code}`);
          continue;
        }
        const precioUnit = item.price_cents ?? product.precio_cents;
        items.push({
          producto_id: product.producto_id,
          cantidad: item.quantity,
          precio_unit: precioUnit,
        });
      }

      if (!items.length) {
        console.warn(`La orden ${order.order_code} no tiene items válidos, se omite.`);
        continue;
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.precio_unit * item.cantidad,
        0,
      );
      const envio = order.shipping_cents ?? 0;
      const total = subtotal + envio;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertOrderQuery = `
          INSERT INTO ordenes (
            order_code,
            usuario_id,
            direccion_id,
            metodo_pago,
            subtotal_cents,
            envio_cents,
            total_cents,
            metodo_despacho,
            estado_pago,
            estado_envio,
            notas_cliente,
            notas_internas,
            fecha_pago,
            fecha_envio,
            fecha_entrega_real,
            numero_seguimiento,
            empresa_envio,
            creado_en
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18
          )
          ON CONFLICT (order_code) DO UPDATE SET
            usuario_id = EXCLUDED.usuario_id,
            direccion_id = EXCLUDED.direccion_id,
            metodo_pago = EXCLUDED.metodo_pago,
            subtotal_cents = EXCLUDED.subtotal_cents,
            envio_cents = EXCLUDED.envio_cents,
            total_cents = EXCLUDED.total_cents,
            metodo_despacho = EXCLUDED.metodo_despacho,
            estado_pago = EXCLUDED.estado_pago,
            estado_envio = EXCLUDED.estado_envio,
            notas_cliente = EXCLUDED.notas_cliente,
            notas_internas = EXCLUDED.notas_internas,
            fecha_pago = EXCLUDED.fecha_pago,
            fecha_envio = EXCLUDED.fecha_envio,
            fecha_entrega_real = EXCLUDED.fecha_entrega_real,
            numero_seguimiento = EXCLUDED.numero_seguimiento,
            empresa_envio = EXCLUDED.empresa_envio,
            creado_en = EXCLUDED.creado_en
          RETURNING orden_id;
        `;

        const values = [
          order.order_code,
          usuarioId,
          direccionId,
          order.metodo_pago || null,
          subtotal,
          envio,
          total,
          order.metodo_despacho || "standard",
          order.estado_pago || "pendiente",
          order.estado_envio || "preparacion",
          order.notas_cliente || null,
          order.notas_internas || null,
          order.fecha_pago || null,
          order.fecha_envio || null,
          order.fecha_entrega_real || null,
          order.numero_seguimiento || null,
          order.empresa_envio || null,
          order.created_at || new Date().toISOString(),
        ];

        const {
          rows: [{ orden_id: ordenId }],
        } = await client.query(insertOrderQuery, values);

        await client.query("DELETE FROM orden_items WHERE orden_id = $1", [ordenId]);

        const insertItemQuery = `
          INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
          VALUES ($1, $2, $3, $4)
        `;

        for (const item of items) {
          await client.query(insertItemQuery, [
            ordenId,
            item.producto_id,
            item.cantidad,
            item.precio_unit,
          ]);
        }

        await client.query("COMMIT");
        console.log(`Orden histórica insertada: ${order.order_code}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    console.log("Seed de órdenes históricas completado.");
  } catch (error) {
    console.error("Error al insertar órdenes históricas:", error);
  } finally {
    await pool.end();
  }
}

seedOrders();
