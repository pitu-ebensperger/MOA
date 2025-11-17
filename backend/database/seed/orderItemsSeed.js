import pool from "../config.js";
import { ORDER_ITEMS } from "./orderItemsData.js";

async function seedOrderItems() {
  try {
    for (const item of ORDER_ITEMS) {
      const orderRes = await pool.query(
        "SELECT orden_id FROM ordenes WHERE order_code = $1",
        [item.orderCode]
      );

      if (!orderRes.rowCount) {
        console.warn(`Orden '${item.orderCode}' no encontrada para item`);
        continue;
      }

      const productoRes = await pool.query(
        "SELECT producto_id, precio_cents FROM productos WHERE slug = $1",
        [item.productSlug]
      );

      if (!productoRes.rowCount) {
        console.warn(`Producto '${item.productSlug}' no encontrado para orden '${item.orderCode}'`);
        continue;
      }

      const ordenId = orderRes.rows[0].orden_id;
      const productoId = productoRes.rows[0].producto_id;
      const precioUnit = productoRes.rows[0].precio_cents;

      await pool.query(
        `
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
          VALUES ($1, $2, $3, $4)
        ON CONFLICT (orden_id, producto_id) DO UPDATE SET
          cantidad = EXCLUDED.cantidad,
          precio_unit = EXCLUDED.precio_unit
      `,
        [ordenId, productoId, item.quantity, precioUnit]
      );
    }

    console.log("Items de orden sincronizados");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar items de orden:", error);
    process.exit(1);
  }
}

seedOrderItems();
