import pool from "../../database/config.js";

export async function getCategories(req, res, next) {
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
    next(error);
  }
}
