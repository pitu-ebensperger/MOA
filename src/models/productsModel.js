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
