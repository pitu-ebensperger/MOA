import { apiClient } from "./api-client.js";

/**
 * Servicio para gestionar la configuración de la tienda
 */

/**
 * Obtener la configuración actual de la tienda
 * @returns {Promise<Object>} Configuración de la tienda
 */
export const getStoreConfig = async () => {
  try {
    const response = await apiClient.public.get("/api/config");
    console.log("CONFIG RESPONSE:", response);
    return response;
  } catch (error) {
    console.error("BACKEND ERROR RAW:", error);
    console.error("BACKEND ERROR DATA:", error.data);
    throw error;
  }
};

/**
 * Actualizar la configuración de la tienda
 * @param {Object} configData - Datos de configuración a actualizar
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateStoreConfig = async (configData) => {
  try {
    const response = await apiClient.private.put("/api/config", configData);
    return response;
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    throw error;
  }
};

/**
 * Inicializar configuración con valores por defecto
 * @returns {Promise<Object>} Configuración inicializada
 */
export const initializeStoreConfig = async () => {
  try {
    const response = await apiClient.private.post("/api/config/init");
    return response;
  } catch (error) {
    console.error("Error al inicializar configuración:", error);
    throw error;
  }
};
