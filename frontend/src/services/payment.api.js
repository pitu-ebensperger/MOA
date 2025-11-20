import { apiClient } from '@/services/api-client'

/**
 * Obtener todos los métodos de pago del usuario autenticado
 * @returns {Promise<Array>} - Array de métodos de pago
 */
export const getPaymentMethods = async () => {
  const response = await apiClient.get('/api/metodos-pago');
  return response.data;
};

/**
 * Obtener método de pago por ID
 * @param {number} metodoPagoId - ID del método de pago
 * @returns {Promise<Object>} - Objeto método de pago
 */
export const getPaymentMethodById = async (metodoPagoId) => {
  const response = await apiClient.get(`/api/metodos-pago/${metodoPagoId}`);
  return response.data;
};

/**
 * Crear nuevo método de pago
 * @param {Object} paymentData - Datos del método de pago
 * @param {string} paymentData.tipo_metodo - Tipo: 'credito' o 'debito'
 * @param {string} paymentData.ultimos_digitos - Últimos 4 dígitos de la tarjeta
 * @param {string} paymentData.nombre_titular - Nombre del titular
 * @param {string} paymentData.fecha_expiracion - Fecha MM/YY
 * @param {string} paymentData.token_pago - Token tokenizado del procesador
 * @param {boolean} [paymentData.predeterminado] - Si es método predeterminado
 * @returns {Promise<Object>} - Método de pago creado
 */
export const createPaymentMethod = async (paymentData) => {
  const response = await apiClient.post('/api/metodos-pago', paymentData);
  return response.data;
};

/**
 * Actualizar método de pago existente
 * @param {number} metodoPagoId - ID del método de pago
 * @param {Object} paymentData - Datos a actualizar
 * @returns {Promise<Object>} - Método de pago actualizado
 */
export const updatePaymentMethod = async (metodoPagoId, paymentData) => {
  const response = await apiClient.patch(`/api/metodos-pago/${metodoPagoId}`, paymentData);
  return response.data;
};

/**
 * Establecer método de pago como predeterminado
 * @param {number} metodoPagoId - ID del método de pago
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const setDefaultPaymentMethod = async (metodoPagoId) => {
  const response = await apiClient.patch(`/api/metodos-pago/${metodoPagoId}/predeterminado`);
  return response.data;
};

/**
 * Eliminar método de pago
 * @param {number} metodoPagoId - ID del método de pago
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deletePaymentMethod = async (metodoPagoId) => {
  const response = await apiClient.delete(`/api/metodos-pago/${metodoPagoId}`);
  return response.data;
};
