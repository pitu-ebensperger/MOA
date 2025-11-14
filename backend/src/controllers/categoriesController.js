// backend/src/controllers/categories.controller.js
import pool from "../../database/config.js";

export async function getCategories(req, res) {
  try {
    const query = `
      SELECT categoria_id, nombre, slug, descripcion, cover_image
      FROM categorias
      ORDER BY categoria_id;
    `;
    const { rows } = await pool.query(query);

    res.json({
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({
      error: "Error al obtener categorías",
    });
  }
}
