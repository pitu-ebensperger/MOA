import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setOnUnauthorized, setTokenGetter } from "../services/api-client.js";
import { authApi } from "../services/auth.api.js";

// ---- Constantes y utilidades ----------------------------------
const TOKEN_KEY = "moa.accessToken";
const USER_KEY  = "moa.user";
const STATUS = { IDLE: "idle", LOADING: "loading", AUTH: "authenticated" };

// Permite que el backend cambie nombre/campo del rol sin romper front
const isAdminRole = (user) =>
  user?.role === "admin" || user?.rol === "admin" || user?.role_code === "ADMIN";

const safeParseJson = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const storage = {
  get: (key) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  set: (key, value) => { if (typeof window !== "undefined") window.localStorage.setItem(key, value); },
  remove: (key) => { if (typeof window !== "undefined") window.localStorage.removeItem(key); },
};

// ---- Contexto --------------------------------------------------
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Estado inicial: si hay token guardado, intentamos cargar perfil
  const [token, setToken] = useState(() => storage.get(TOKEN_KEY));
  const [user, setUser]   = useState(() => {
    const raw = storage.get(USER_KEY);
    return raw ? safeParseJson(raw) : null;
  });
  const [status, setStatus] = useState(() => (storage.get(TOKEN_KEY) ? STATUS.LOADING : STATUS.IDLE));
  const [error, setError] = useState(null);

  // --- Sync helpers (token/user <-> storage + api-client) -------
  const syncToken = useCallback((nextToken) => {
    setTokenGetter(() => nextToken);           // api-client leerá el token actual
    if (nextToken) storage.set(TOKEN_KEY, nextToken);
    else storage.remove(TOKEN_KEY);
    setToken(nextToken);
  }, []);

  const syncUser = useCallback((nextUser) => {
    if (nextUser) storage.set(USER_KEY, JSON.stringify(nextUser));
    else storage.remove(USER_KEY);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    syncToken(null);
    syncUser(null);
    setStatus(STATUS.IDLE);
    setError(null);
  }, [syncToken, syncUser]);

  // api-client: define cómo actuar ante 401 global y cómo obtener token
  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(() => logout);
  }, [token, logout]);

  // Si hay token pero no user, intenta cargar perfil
  useEffect(() => {
    if (!token || user) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const profile = await authApi.profile();
        if (cancelled) return;
        syncUser(profile);
        setStatus(STATUS.AUTH);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        logout();
      }
    })();

    return () => { cancelled = true; };
  }, [token, user, syncUser, logout]);

  // --- Acciones públicas ---------------------------------------
  const login = useCallback(
    async (credentials) => {
      setStatus(STATUS.LOADING);
      setError(null);
      const { token: nextToken, user: profile } = await authApi.login(credentials);
      syncToken(nextToken);
      syncUser(profile);
      setStatus(STATUS.AUTH);
    },
    [syncToken, syncUser],
  );

  const register = useCallback(
    async (payload) => {
      setStatus(STATUS.LOADING);
      setError(null);
      const { token: nextToken, user: profile } = await authApi.register(payload);
      syncToken(nextToken);
      syncUser(profile);
      setStatus(STATUS.AUTH);
    },
    [syncToken, syncUser],
  );

  // para editar perfil
  const refreshProfile = useCallback(async () => {
    setStatus(STATUS.LOADING);
    setError(null);
    try {
      const profile = await authApi.profile();
      syncUser(profile);
      setStatus(STATUS.AUTH);
      return profile;
    } catch (err) {
      setError(err);
      logout();
      throw err;
    }
  }, [syncUser, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      isAuthenticated: Boolean(token),
      isAdmin: isAdminRole(user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, status, error, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
