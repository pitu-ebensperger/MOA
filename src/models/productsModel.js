import pool from "../../database/config.js";

export async function updateProductStock(productId, quantity) {
  try {
    const query = `
      UPDATE productos
      SET stock = stock - $1
      WHERE producto_id = $2
      RETURNING producto_id, stock;
    `;

    const { rows } = await pool.query(query, [quantity, productId]);

    if (rows.length === 0) {
      throw new Error("No existe el producto con ese ID");
    }

    return rows[0];
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    throw error;
  }
}

export const deleteProduct = async (productId) => {
  const sql = `
    DELETE FROM productos
    WHERE producto_id = $1
    RETURNING producto_id;
  `;

  const { rows } = await pool.query(sql, [productId]);
  return rows.length > 0;
};

export const updateProduct = async (productId, data) => {
  const allowed = [
    "nombre",
    "slug",
    "sku",
    "precio_cents",
    "compare_at_price_cents",
    "stock",
    "status",
    "descripcion",
    "descripcion_corta",
    "img_url",
    "gallery",
    "badge",
    "tags",
    "color",
    "material",
    "dimensions",
    "weight",
    "specs",
    "categoria_id",
    "collection_id",
  ];

  Object.keys(data).forEach((key) => {
    if (data[key] === "" || data[key] === undefined) {
      data[key] = null;
    }
  });

  const keys = Object.keys(data).filter((k) => allowed.includes(k));

  if (keys.length === 0) {
    throw new Error("No hay campos válidos para actualizar");
  }

  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = keys.map((k) => data[k]);

  const sql = `
    UPDATE productos
    SET ${sets}, updated_at = now()
    WHERE producto_id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(sql, [productId, ...values]);

  return rows[0] || null;
};
