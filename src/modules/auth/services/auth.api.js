import { apiClient } from "../../../services/api-client.js";
import { API_PATHS } from "../../../config/api-paths.js";

export const authApi = {
  login: (payload) => apiClient.public.post(API_PATHS.auth.login, payload),
  register: (payload) => apiClient.public.post(API_PATHS.auth.register, payload),
  profile: () => apiClient.private.get(API_PATHS.auth.profile),
};
