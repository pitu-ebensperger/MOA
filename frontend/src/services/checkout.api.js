import { apiClient } from '@/services/api-client'

/**
 * Crear orden desde el carrito
 * @param {Object} checkoutData 
 * @param {number} [checkoutData.direccion_id] 
 * @param {number} [checkoutData.metodo_pago_id] 
 * @param {string} checkoutData.metodo_despacho 
 * @param {string} [checkoutData.notas_cliente] 
 * @param {boolean} [checkoutData.usar_direccion_guardada] 
 * @param {Object} [checkoutData.direccion_nueva] -
 * @param {Object} [checkoutData.contacto] 
 * @returns {Promise<Object>} - Orden creada
 */
export const createOrder = async (checkoutData) => {
  const response = await apiClient.post('/api/checkout', checkoutData);
  return response.data;
};

/**
 * Obtener órdenes del usuario
 * @param {Object} params 
 * @param {number} [params.limit]
 * @param {number} [params.offset] 
 * @param {string} [params.estado_pago] 
 * @param {string} [params.estado_envio] 
 * @returns {Promise<Array>} - Lista de órdenes
 */
export const getUserOrders = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `/api/orders${queryParams ? `?${queryParams}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Obtener orden por ID
 * @param {number} orderId 
 * @returns {Promise<Object>} - Orden con todos sus detalles
 */
export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response.data;
};

/**
 * Procesar pago de una orden
 * @param {number} orderId 
 * @param {Object} paymentData 
 * @param {number} paymentData.metodo_pago_id 
 * @param {string} [paymentData.token_pago] 
 * @returns {Promise<Object>} - Orden actualizada
 */
export const processOrderPayment = async (orderId, paymentData) => {
  const response = await apiClient.post(`/api/orders/${orderId}/payment`, paymentData);
  return response.data;
};

/**
 * Cancelar orden
 * @param {number} orderId 
 * @returns {Promise<Object>} - Orden cancelada
 */
export const cancelOrder = async (orderId) => {
  const response = await apiClient.delete(`/api/orders/${orderId}`);
  return response.data;
};
