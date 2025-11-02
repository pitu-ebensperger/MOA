import { apiClient } from "../../../services/api-client.js";
import { API_PATHS } from "../../../config/api-paths.js";

export const authApi = {
  login: async (payload) => {
    // POST /auth/login
    const res = await apiClient.public.post(API_PATHS.auth.login, payload);
    return res?.data ?? res;
  },

  register: async (payload) => {
    // POST /auth/register
    const res = await apiClient.public.post(API_PATHS.auth.register, payload);
    return res?.data ?? res;
  },

  profile: async () => {
    // GET /auth/profile (requiere token)
    const res = await apiClient.private.get(API_PATHS.auth.profile);
    return res?.data ?? res;
  },
};
