import { pool } from "../../database/config.js";

/**
 * Obtiene estadísticas generales del dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { periodo = '30' } = req.query; // días

    const statsQuery = `
      SELECT 
        -- Totales generales
        COUNT(*)::INT as total_ordenes,
        COUNT(*) FILTER (WHERE estado_pago = 'pagado')::INT as ordenes_pagadas,
        
        -- Ingresos
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(SUM(total_cents) FILTER (WHERE estado_pago = 'pagado'), 0)::BIGINT as ingresos_confirmados,
        
        -- Promedios
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        COALESCE(ROUND(AVG(total_cents) FILTER (WHERE estado_pago = 'pagado')), 0)::INT as ticket_promedio_pagado
        
      FROM ordenes
      WHERE creado_en >= NOW() - INTERVAL '${parseInt(periodo)} days'
        AND estado_orden = 'confirmed'
    `;

    const { rows } = await pool.query(statsQuery);

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene estadísticas por método de pago
 */
export const getPaymentMethodStats = async (req, res) => {
  try {
    const { periodo = '30' } = req.query;

    const query = `
      SELECT 
        metodo_pago,
        COUNT(*)::INT as cantidad_ordenes,
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje_uso
      FROM ordenes 
      WHERE estado_orden = 'confirmed'
        AND creado_en >= NOW() - INTERVAL '${parseInt(periodo)} days'
      GROUP BY metodo_pago
      ORDER BY ingresos_totales DESC
    `;

    const { rows } = await pool.query(query);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats de pago:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene estadísticas por método de envío
 */
export const getShippingMethodStats = async (req, res) => {
  try {
    const { periodo = '30' } = req.query;

    const query = `
      SELECT 
        metodo_despacho,
        COUNT(*)::INT as cantidad_ordenes,
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(SUM(envio_cents), 0)::BIGINT as ingresos_envio,
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje_uso
      FROM ordenes 
      WHERE estado_orden = 'confirmed'
        AND creado_en >= NOW() - INTERVAL '${parseInt(periodo)} days'
      GROUP BY metodo_despacho
      ORDER BY cantidad_ordenes DESC
    `;

    const { rows } = await pool.query(query);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats de envío:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de métodos de envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getDashboardStats,
  getPaymentMethodStats,
  getShippingMethodStats
};
