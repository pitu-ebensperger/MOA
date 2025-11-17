import pool from "../../database/config.js";

export async function getCategories(req, res, next) {
  try {
    const query = `
      SELECT 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage"
      FROM categorias
      ORDER BY id;
    `;
    const { rows } = await pool.query(query);

    // El frontend normaliza directamente arrays con estos campos camelCase
    res.json(rows);
  } catch (error) {
    next(error);
  }
}
