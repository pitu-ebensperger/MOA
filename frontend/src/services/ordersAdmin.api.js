import { apiClient } from './api-client.js';

export const ordersAdminApi = {
  /**
   * Obtener todas las órdenes con filtros opcionales
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>} Lista de órdenes paginada
   */
  getAll: (params = {}) => {
    return apiClient.get('/admin/pedidos', { params });
  },

  /**
   * Obtener una orden específica por ID
   * @param {string|number} ordenId - ID de la orden
   * @returns {Promise<Object>} Orden completa
   */
  getById: (ordenId) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    return apiClient.get(`/admin/pedidos/${ordenId}`);
  },

  /**
   * Actualizar el estado de una orden
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de actualización
   * @param {string} data.estado_pago - Nuevo estado
   * @param {string} [data.motivo_cambio] - Motivo del cambio
   * @returns {Promise<Object>} Orden actualizada
   */
  updateStatus: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.estado_pago) {
      throw new Error('Estado de pago es requerido');
    }
    return apiClient.patch(`/admin/pedidos/${ordenId}/estado`, data);
  },

  /**
   * Actualizar estado completo de una orden (Admin)
   * PUT /api/admin/orders/:id/status
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de actualización completos
   * @param {string} [data.estado_pago] - Estado de pago
   * @param {string} [data.estado_envio] - Estado de envío
   * @param {string} [data.numero_seguimiento] - Número de seguimiento
   * @param {string} [data.empresa_envio] - Empresa de envío/courier
   * @returns {Promise<Object>} Orden actualizada
   */
  updateOrderStatus: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    return apiClient.put(`/api/admin/orders/${ordenId}/status`, data);
  },

  /**
   * Agregar información de tracking
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de tracking
   * @param {string} data.numero_seguimiento - Número de seguimiento
   * @param {string} [data.empresa_envio] - Empresa de envío
   * @param {string} [data.url_seguimiento] - URL de seguimiento
   * @returns {Promise<Object>} Resultado de la operación
   */
  addTracking: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.numero_seguimiento) {
      throw new Error('Número de seguimiento es requerido');
    }
    return apiClient.post(`/admin/pedidos/${ordenId}/seguimiento`, data);
  },

  /**
   * Obtener estadísticas de órdenes
   * @param {Object} [params={}] - Parámetros opcionales
   * @returns {Promise<Object>} Estadísticas
   */
  getStats: (params = {}) => {
    return apiClient.get('/admin/pedidos/stats', { params });
  },

};
