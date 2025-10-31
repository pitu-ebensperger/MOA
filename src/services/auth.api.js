import { apiClient } from "../../../shared/services/api-client.js";
import { API_PATHS } from "../../../config/api-paths.js";

const persistToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("auth_token", token);
  } else {
    window.localStorage.removeItem("auth_token");
  }
};

const getPersistedToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
};

const shapeAuthResponse = (response) => ({
  token: response.token,
  user: response.user,
});

const login = async ({ email, password }) => {
  const response = await apiClient.public.post(API_PATHS.auth.login, {
    email,
    password,
  });
  const authData = shapeAuthResponse(response);
  persistToken(authData.token);
  return authData;
};

const register = async ({ name, email, password }) => {
  const response = await apiClient.public.post(API_PATHS.auth.register, {
    name,
    email,
    password,
  });
  const authData = shapeAuthResponse(response);
  persistToken(authData.token);
  return authData;
};

const getProfile = async () => {
  const token = getPersistedToken();
  if (!token) return null;
  return apiClient.private.get(API_PATHS.auth.profile);
};

const logout = () => persistToken(null);

export const authApi = {
  login,
  register,
  getProfile,
  logout,
  getPersistedToken,
};
