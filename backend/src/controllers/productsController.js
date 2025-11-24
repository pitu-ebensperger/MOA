import pool from "../../database/config.js";

export async function getProducts(req, res) {
  try {
    const query = `
      SELECT
        producto_id AS id,
        public_id AS "publicId",
        nombre AS name,
        slug,
        sku,
        precio_cents AS price,
        compare_at_price_cents AS "compareAtPrice",
        stock,
        status,
        descripcion AS description,
        descripcion_corta AS "descriptionShort",
        img_url AS "imgUrl",
        gallery,
        badge,
        tags,
        color,
        material,
        dimensions,
        weight,
        specs,
        categoria_id AS "fk_category_id",
        collection_id AS "fk_collection_id",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM productos
      ORDER BY producto_id;
    `;
    const { rows } = await pool.query(query);
    res.json({ items: rows });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({
      error: "Error al obtener los productos",
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { slug } = req.params;

    const query = `
      SELECT
        producto_id AS id,
        public_id AS "publicId",
        nombre AS name,
        slug,
        sku,
        precio_cents AS price,
        compare_at_price_cents AS "compareAtPrice",
        stock,
        status,
        descripcion AS description,
        descripcion_corta AS "descriptionShort",
        img_url AS "imgUrl",
        gallery,
        badge,
        tags,
        color,
        material,
        dimensions,
        weight,
        specs,
        categoria_id AS "fk_category_id",
        collection_id AS "fk_collection_id",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM productos
      WHERE slug = $1
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({
      error: "Error al obtener el producto",
    });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      nombre,
      categoria_id,
      collection_id,
      sku,
      precio_cents,
      compare_at_price_cents,
      stock,
      descripcion_corta,
      descripcion,
      img_url,
    } = req.body;

    if (!nombre || !sku || precio_cents == null) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const slug = nombre
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const public_id = `prod_${Date.now()}`;

    const query = `
      INSERT INTO productos (
        public_id,
        nombre,
        slug,
        sku,
        precio_cents,
        compare_at_price_cents,
        stock,
        descripcion,
        descripcion_corta,
        img_url,
        categoria_id,
        collection_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      public_id,
      nombre,
      slug,
      sku,
      precio_cents,
      compare_at_price_cents,
      stock ?? 0,
      descripcion,
      descripcion_corta,
      img_url,
      categoria_id || null,
      collection_id || null,
    ];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      error: "Error al crear el producto en la base de datos",
    });
  }
}
