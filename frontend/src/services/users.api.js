import { apiClient } from './api-client.js';
import { API_PATHS } from '../config/api-paths.js';

export const usersApi = {
  // GET /usuario/:id - Obtener usuario por ID
  async getUserById(id) {
    if (!id) throw new Error('User ID is required');
    const data = await apiClient.private.get(`/usuario/${id}`);
    return data;
  },

  // PATCH /usuario/:id - Actualizar usuario
  async updateUser(id, updateData) {
    if (!id) throw new Error('User ID is required');
    const data = await apiClient.private.patch(`/usuario/${id}`, updateData);
    return data;
  },

  // GET /usuario - Obtener perfil del usuario autenticado (desde token)
  async getCurrentUser() {
    const data = await apiClient.private.get('/usuario');
    return data;
  }
};


/* 
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

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};


export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};**/