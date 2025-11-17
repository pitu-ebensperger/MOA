import { apiClient } from './api-client.js';

export const ordersAdminApi = {
  /**
   * Obtener todas las órdenes con filtros avanzados
   * @param {Object} params
   * @param {number} params.limit
   * @param {number} params.offset 
   * @param {string} params.estado_pago 
   * @param {string} params.estado_envio 
   * @param {string} params.metodo_despacho 
   * @param {string} params.fecha_desde 
   * @param {string} params.fecha_hasta 
   * @param {string} params.search 
   * @param {string} params.order_by 
   * @param {string} params.order_dir
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: (params = {}) => {
    return apiClient.private.get('/admin/pedidos', { params });
  },

  /**
   * Obtener orden por ID con detalles completos (admin view)
   * @param {number|string} ordenId 
   * @returns {Promise<Object>} Orden completo
   */
  getById: (ordenId) => {
    return apiClient.private.get(`/admin/pedidos/${ordenId}`);
  },

  /**
   * Actualizar estado de una orden (pago y/o envío)
   * @param {number|string} ordenId 
   * @param {Object} data
   * @param {string} data.estado_pago 
   * @param {string} data.estado_envio 
   * @param {string} data.notas_internas
   * @param {string} data.fecha_pago 
   * @param {string} data.fecha_envio
   * @param {string} data.fecha_entrega_real 
   * @returns {Promise<Object>} Orden actualizada
   */
  updateStatus: (ordenId, data) => {
    return apiClient.private.patch(`/admin/pedidos/${ordenId}/estado`, data);
  },

  /**
   * Agregar información de seguimiento (tracking)
   * @param {number|string} ordenId 
   * @param {Object} data 
   * @param {string} data.numero_seguimiento 
   * @param {string} data.empresa_envio 
   * @param {string} data.fecha_envio 
   * @returns {Promise<Object>} Orden con tracking actualizado
   */
  addTracking: (ordenId, data) => {
    return apiClient.private.post(`/admin/pedidos/${ordenId}/seguimiento`, data);
  },

  /**
   * Obtener estadísticas de órdenes
   * @param {Object} params 
   * @param {string} params.fecha_desde 
   * @param {string} params.fecha_hasta
   * @returns {Promise<Object>} Estadísticas agregadas
   */
  getStats: (params = {}) => {
    return apiClient.private.get('/admin/pedidos/stats', { params });
  },

  /**
   * Actualizar notas internas de una orden
   * @param {number|string} ordenId 
   * @param {string} notasInternas
   * @returns {Promise<Object>} Orden con notas actualizadas
   */
  updateNotes: (ordenId, notasInternas) => {
    return apiClient.private.patch(`/admin/pedidos/${ordenId}/notas`, {
      notas_internas: notasInternas,
    });
  },

  /**
   * Exportar órdenes a CSV (generación client-side)
   * @param {Array} orders - Array de órdenes a exportar
   * @returns {Blob} Archivo CSV
   */
  exportToCSV: (orders) => {
    // Headers del CSV
    const headers = [
      'Order Code',
      'Fecha',
      'Cliente',
      'Email',
      'Total (CLP)',
      'Estado Pago',
      'Estado Envío',
      'Método Despacho',
      'Tracking',
      'Empresa Envío',
    ];

    // Convertir órdenes a rows
    const rows = orders.map(order => [
      order.order_code || '',
      order.creado_en || '',
      order.usuario_nombre || '',
      order.usuario_email || '',
      (order.total_cents / 100).toFixed(0),
      order.estado_pago || '',
      order.estado_envio || '',
      order.metodo_despacho || '',
      order.numero_seguimiento || '',
      order.empresa_envio || '',
    ]);

    // Construir CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Crear Blob
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },
};
