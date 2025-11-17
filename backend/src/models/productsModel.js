import pool from "../../database/config.js";
import { nanoid } from "nanoid";

/**
 * Modelo para gestión de productos
 */
export const productsModel = {
  /**
   * Obtener todos los productos con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Productos paginados
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      categoryId = null,
      status = null,
      minPrice = null,
      maxPrice = null,
      onlyLowStock = false,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const values = [];
    let paramIndex = 1;

    // Construir WHERE clause dinámicamente
    const whereConditions = [];

    if (search) {
      whereConditions.push(`(p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      whereConditions.push(`p.categoria_id = $${paramIndex}`);
      values.push(categoryId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (minPrice !== null) {
      whereConditions.push(`p.precio_cents >= $${paramIndex}`);
      values.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== null) {
      whereConditions.push(`p.precio_cents <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    if (onlyLowStock) {
      whereConditions.push(`p.stock <= 5`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validar sortBy para evitar SQL injection
    const allowedSortFields = ['nombre', 'precio_cents', 'stock', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.compare_at_price_cents AS "compareAtPriceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.descripcion_corta AS "shortDescription",
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.specs AS specs,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      ${whereClause}
      ORDER BY p.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);

    // Consulta para el total
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM productos p
      ${whereClause}
    `;

    const [productsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)) // Remover limit y offset
    ]);

    const products = productsResult.rows;
    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
      items: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },

  /**
   * Obtener producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} Producto o null
   */
  async getById(id) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.compare_at_price_cents AS "compareAtPriceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.descripcion_corta AS "shortDescription",
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.specs AS specs,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Obtener producto por public_id
   * @param {string} publicId - Public ID del producto
   * @returns {Promise<Object|null>} Producto o null
   */
  async getByPublicId(publicId) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.compare_at_price_cents AS "compareAtPriceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.descripcion_corta AS "shortDescription",
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.specs AS specs,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.public_id = $1;
    `;
    const { rows } = await pool.query(query, [publicId]);
    return rows[0] || null;
  },

  /**
   * Obtener producto por slug
   * @param {string} slug - Slug del producto
   * @returns {Promise<Object|null>} Producto o null
   */
  async getBySlug(slug) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.compare_at_price_cents AS "compareAtPriceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.descripcion_corta AS "shortDescription",
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.specs AS specs,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.slug = $1;
    `;
    const { rows } = await pool.query(query, [slug]);
    return rows[0] || null;
  },

  /**
   * Crear nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(productData) {
    const {
      categoria_id,
      nombre,
      slug,
      sku,
      precio_cents,
      compare_at_price_cents = null,
      stock = 0,
      status = 'activo',
      descripcion = null,
      descripcion_corta = null,
      img_url = null,
      gallery = [],
      badge = [],
      tags = [],
      color = null,
      material = null,
      dimensions = null,
      weight = null,
      specs = null
    } = productData;

    const publicId = nanoid();

    const query = `
      INSERT INTO productos (
        public_id, categoria_id, nombre, slug, sku, precio_cents,
        compare_at_price_cents, stock, status, descripcion, descripcion_corta,
        img_url, gallery, badge, tags, color, material, dimensions, weight, specs
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING producto_id AS id;
    `;

    const values = [
      publicId, categoria_id, nombre, slug, sku, precio_cents,
      compare_at_price_cents, stock, status, descripcion, descripcion_corta,
      img_url, gallery, badge, tags, color, material, dimensions, weight, specs
    ];

    const { rows } = await pool.query(query, values);
    const productId = rows[0].id;

    // Retornar el producto creado
    return await this.getById(productId);
  },

  /**
   * Actualizar producto
   * @param {number} id - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async update(id, productData) {
    // Construir query dinámicamente solo con campos presentes
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    const allowedFields = {
      categoria_id: 'categoria_id',
      nombre: 'nombre',
      slug: 'slug',
      sku: 'sku',
      precio_cents: 'precio_cents',
      compare_at_price_cents: 'compare_at_price_cents',
      stock: 'stock',
      status: 'status',
      descripcion: 'descripcion',
      descripcion_corta: 'descripcion_corta',
      img_url: 'img_url',
      gallery: 'gallery',
      badge: 'badge',
      tags: 'tags',
      color: 'color',
      material: 'material',
      dimensions: 'dimensions',
      weight: 'weight',
      specs: 'specs'
    };

    Object.keys(allowedFields).forEach(field => {
      if (productData.hasOwnProperty(field)) {
        fields.push(`${allowedFields[field]} = $${paramIndex}`);
        values.push(productData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      // No hay campos para actualizar, devolver el producto actual
      return await this.getById(id);
    }

    // Agregar updated_at
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE productos
      SET ${fields.join(', ')}
      WHERE producto_id = $1
      RETURNING producto_id AS id;
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return null;
    }

    // Retornar el producto actualizado
    return await this.getById(id);
  },

  /**
   * Eliminar producto (soft delete cambiando status)
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} true si se eliminó, false si no
   */
  async softDelete(id) {
    const query = `
      UPDATE productos
      SET status = 'inactivo', updated_at = NOW()
      WHERE producto_id = $1
      RETURNING producto_id;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  /**
   * Eliminar producto permanentemente
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} true si se eliminó, false si no
   */
  async hardDelete(id) {
    // Verificar si hay órdenes asociadas
    const checkQuery = `
      SELECT COUNT(*)::int as count 
      FROM orden_items 
      WHERE producto_id = $1;
    `;
    const { rows: checkRows } = await pool.query(checkQuery, [id]);

    if (checkRows[0].count > 0) {
      throw new Error(
        `No se puede eliminar el producto porque está presente en ${checkRows[0].count} orden(es)`
      );
    }

    const query = `
      DELETE FROM productos
      WHERE producto_id = $1
      RETURNING producto_id;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  /**
   * Verificar si un slug ya existe
   * @param {string} slug - Slug a verificar
   * @param {number} excludeId - ID a excluir (para updates)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async slugExists(slug, excludeId = null) {
    let query = `
      SELECT COUNT(*)::int as count 
      FROM productos 
      WHERE slug = $1
    `;
    const values = [slug];

    if (excludeId) {
      query += ` AND producto_id != $2`;
      values.push(excludeId);
    }

    const { rows } = await pool.query(query, values);
    return rows[0].count > 0;
  },

  /**
   * Verificar si un SKU ya existe
   * @param {string} sku - SKU a verificar
   * @param {number} excludeId - ID a excluir (para updates)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async skuExists(sku, excludeId = null) {
    let query = `
      SELECT COUNT(*)::int as count 
      FROM productos 
      WHERE sku = $1
    `;
    const values = [sku];

    if (excludeId) {
      query += ` AND producto_id != $2`;
      values.push(excludeId);
    }

    const { rows } = await pool.query(query, values);
    return rows[0].count > 0;
  },

  /**
   * Actualizar stock de producto
   * @param {number} id - ID del producto
   * @param {number} quantity - Cantidad a agregar/quitar (negativo para restar)
   * @returns {Promise<Object|null>} Producto actualizado o null
   */
  async updateStock(id, quantity) {
    const query = `
      UPDATE productos
      SET stock = stock + $2, updated_at = NOW()
      WHERE producto_id = $1 AND stock + $2 >= 0
      RETURNING producto_id AS id, stock;
    `;

    const { rows } = await pool.query(query, [id, quantity]);
    
    if (rows.length === 0) {
      return null; // Stock insuficiente o producto no encontrado
    }

    return await this.getById(id);
  },

  /**
   * Obtener productos con stock bajo
   * @param {number} threshold - Umbral de stock bajo (default: 5)
   * @returns {Promise<Array>} Productos con stock bajo
   */
  async getLowStockProducts(threshold = 5) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.nombre AS name,
        p.sku AS sku,
        p.stock AS stock,
        p.status AS status,
        c.nombre AS "categoryName"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.stock <= $1 AND p.status = 'activo'
      ORDER BY p.stock ASC, p.nombre ASC;
    `;
    const { rows } = await pool.query(query, [threshold]);
    return rows;
  },

  /**
   * Obtener estadísticas de productos
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'activo')::int AS active,
        COUNT(*) FILTER (WHERE status = 'inactivo')::int AS inactive,
        COUNT(*) FILTER (WHERE stock <= 5 AND status = 'activo')::int AS low_stock,
        COUNT(*) FILTER (WHERE stock = 0 AND status = 'activo')::int AS out_of_stock,
        AVG(precio_cents)::int AS avg_price_cents,
        SUM(stock)::int AS total_stock
      FROM productos;
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  }
};