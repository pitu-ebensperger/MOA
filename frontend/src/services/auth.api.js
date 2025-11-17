import { apiClient } from '@/services/api-client.js'
import { API_PATHS } from '@/config/api-paths.js'

const buildProfilePath = (userId) =>
  userId
    ? API_PATHS.profile.root(userId)
    : API_PATHS.auth.profile ?? '/auth/perfil'

// Auth API agrupada
export const authApi = {
  async login(payload = {}) {
    const res = await apiClient.post(API_PATHS.auth.login, payload)
    return res
  },

  async register(payload = {}) {
    const res = await apiClient.post(API_PATHS.auth.register, payload)
    return res
  },

  async profile(userId) {
    const endpoint = userId ? API_PATHS.auth.profileUpdate(userId) : API_PATHS.auth.profile
    const res = await apiClient.get(endpoint)
    return res
  },

  async requestPasswordReset(payload = {}) {
    const res = await apiClient.post(
      API_PATHS.auth.requestPasswordReset,
      payload
    )
    return res
  },

  async resetPassword(payload = {}) {
    const res = await apiClient.post(
      API_PATHS.auth.resetPassword,
      payload
    )
    return res
  },
}

// (Opcional) Exponer funciones con nombre si te gusta ese estilo:
export const requestPasswordReset = authApi.requestPasswordReset
export const resetPassword = authApi.resetPassword
