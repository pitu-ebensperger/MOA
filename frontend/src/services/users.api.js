import { apiClient } from './api-client.js';

/**
 * Obtener usuario por ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Obtener todos los usuarios (admin)
 */
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * API objeto que agrupa todas las funciones de usuarios
 */
export const usersApi = {
  getUserById,
  updateUser,
  getAllUsers
};
