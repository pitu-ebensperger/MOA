import pool from "../../database/config.js";

export const createOrderDB = async ({
  usuario_id,
  total_cents,
  delivery_method,
  payment_method,
  notes,
  items,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const order_code = `MOA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;

    // 1. Crear orden
    const insertOrderSQL = `
      INSERT INTO ordenes (order_code, usuario_id, total_cents, delivery_method, payment_method, notes)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING orden_id, order_code
    `;

    const { rows } = await client.query(insertOrderSQL, [
      order_code,
      usuario_id,
      total_cents,
      delivery_method,
      payment_method,
      notes ?? null,
    ]);

    const orden_id = rows[0].orden_id;

    // 2. Insert item + descuento de stock
    const insertItemSQL = `
      INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
      VALUES ($1,$2,$3,$4)
    `;

    const updateStockSQL = `
      UPDATE productos
      SET stock = stock - $1
      WHERE producto_id = $2
      AND stock >= $1
      RETURNING stock;
    `;

    for (const item of items) {
      // 2.1 Insertamos item en orden_items
      await client.query(insertItemSQL, [
        orden_id,
        item.id,
        item.quantity,
        item.price_cents,
      ]);

      // 2.2 Descontar stock, evitando stock negativo
      const stockResult = await client.query(updateStockSQL, [
        item.quantity,
        item.id,
      ]);

      // Si no devolvió filas → no había stock suficiente
      if (stockResult.rows.length === 0) {
        throw new Error(
          `No hay stock suficiente para el producto ID ${item.id}`
        );
      }
    }

    // 3. Confirmar transacción
    await client.query("COMMIT");

    return { orden_id, order_code };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const ordersModel = {
  async findOrdersByUser(usuario_id) {
    const sqlOrders = `
      SELECT 
        o.orden_id,
        o.order_code,
        o.usuario_id,
        o.total_cents,
        o.delivery_method,
        o.payment_method,
        o.status,
        o.creado_en
      FROM ordenes o
      WHERE o.usuario_id = $1
      ORDER BY o.creado_en DESC;
    `;

    const { rows: orders } = await pool.query(sqlOrders, [usuario_id]);

    const sqlItems = `
      SELECT 
        oi.orden_id,
        oi.producto_id,
        oi.cantidad,
        oi.precio_unit,
        p.nombre,
        p.slug,
        p.img_url,
        p.gallery
      FROM orden_items oi
      JOIN productos p ON p.producto_id = oi.producto_id
      WHERE oi.orden_id = ANY ($1)
    `;

    const ordenIds = orders.map((o) => o.orden_id);

    if (!ordenIds.length) return [];

    const { rows: items } = await pool.query(sqlItems, [ordenIds]);

    const grouped = orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.orden_id === o.orden_id),
    }));

    return grouped;
  },
};
