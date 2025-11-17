import { pool } from "../../database/config.js";

/**
 * Modelo para gestión de direcciones de usuarios
 */
export const addressModel = {
  /**
   * Obtener todas las direcciones de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de direcciones
   */
  async getByUserId(userId) {
    const query = `
      SELECT * FROM direcciones 
      WHERE usuario_id = $1 
      ORDER BY es_predeterminada DESC, creado_en DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  /**
   * Obtener una dirección específica por ID
   * @param {number} addressId - ID de la dirección
   * @param {number} userId - ID del usuario (para validar pertenencia)
   * @returns {Promise<Object|null>} Dirección o null
   */
  async getById(addressId, userId) {
    const query = `
      SELECT * FROM direcciones 
      WHERE direccion_id = $1 AND usuario_id = $2
    `;
    const result = await pool.query(query, [addressId, userId]);
    return result.rows[0] || null;
  },

  /**
   * Obtener dirección predeterminada del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object|null>} Dirección predeterminada o null
   */
  async getDefault(userId) {
    const query = `
      SELECT * FROM direcciones 
      WHERE usuario_id = $1 AND es_predeterminada = TRUE 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Crear nueva dirección
   * @param {number} userId - ID del usuario
   * @param {Object} addressData - Datos de la dirección
   * @returns {Promise<Object>} Dirección creada
   */
  async create(userId, addressData) {
    const {
      etiqueta,
      calle,
      numero,
      depto_oficina,
      comuna,
      ciudad,
      region,
      codigo_postal,
      pais = 'Chile',
      telefono_contacto,
      instrucciones_entrega,
      es_predeterminada = false
    } = addressData;

    // Si es predeterminada, quitar flag de otras direcciones
    if (es_predeterminada) {
      await pool.query(
        'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1',
        [userId]
      );
    }

    const query = `
      INSERT INTO direcciones (
        usuario_id, etiqueta, calle, numero, depto_oficina, comuna, ciudad, 
        region, codigo_postal, pais, telefono_contacto, instrucciones_entrega, 
        es_predeterminada
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId, etiqueta, calle, numero, depto_oficina, comuna, ciudad, 
      region, codigo_postal, pais, telefono_contacto, instrucciones_entrega, 
      es_predeterminada
    ]);

    return result.rows[0];
  },

  /**
   * Actualizar dirección existente
   * @param {number} addressId - ID de la dirección
   * @param {number} userId - ID del usuario
   * @param {Object} addressData - Datos a actualizar
   * @returns {Promise<Object|null>} Dirección actualizada o null
   */
  async update(addressId, userId, addressData) {
    // Si es predeterminada, quitar flag de otras direcciones
    if (addressData.es_predeterminada) {
      await pool.query(
        'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1 AND direccion_id != $2',
        [userId, addressId]
      );
    }

    // Construir query dinámicamente solo con campos presentes
    const fields = [];
    const values = [addressId, userId];
    let paramIndex = 3;

    const allowedFields = [
      'etiqueta', 'calle', 'numero', 'depto_oficina', 'comuna', 'ciudad',
      'region', 'codigo_postal', 'pais', 'telefono_contacto', 
      'instrucciones_entrega', 'es_predeterminada'
    ];

    allowedFields.forEach(field => {
      if (addressData.hasOwnProperty(field)) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(addressData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      // No hay campos para actualizar
      return await this.getById(addressId, userId);
    }

    const query = `
      UPDATE direcciones 
      SET ${fields.join(', ')}, actualizado_en = now()
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Establecer dirección como predeterminada
   * @param {number} addressId - ID de la dirección
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object|null>} Dirección actualizada o null
   */
  async setAsDefault(addressId, userId) {
    // Quitar flag de todas
    await pool.query(
      'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1',
      [userId]
    );

    // Establecer nueva predeterminada
    const query = `
      UPDATE direcciones 
      SET es_predeterminada = TRUE, actualizado_en = now()
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [addressId, userId]);
    return result.rows[0] || null;
  },

  /**
   * Eliminar dirección
   * @param {number} addressId - ID de la dirección
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object|null>} Dirección eliminada o null
   */
  async delete(addressId, userId) {
    const query = `
      DELETE FROM direcciones 
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [addressId, userId]);
    return result.rows[0] || null;
  },

  /**
   * Contar direcciones de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de direcciones
   */
  async countByUserId(userId) {
    const query = 'SELECT COUNT(*)::int as count FROM direcciones WHERE usuario_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0].count;
  }
};
