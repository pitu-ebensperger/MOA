import { useCallback, useEffect, useMemo, useState } from "react";
import { setOnUnauthorized, setTokenGetter } from "../services/api-client.js";
import { authApi } from "../services/auth.api.js";
import { AuthContext, isAdminRole } from "./auth-context.js";
import { usePersistentState } from "../hooks/usePersistentState.js";

// ---- Constantes y utilidades ----------------------------------
const TOKEN_KEY = "moa.accessToken";
const USER_KEY  = "moa.user";
const STATUS = { IDLE: "idle", LOADING: "loading", AUTH: "authenticated" };

const safeParseJson = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const identity = (value) => value;

// ---- Contexto --------------------------------------------------
export const AuthProvider = ({ children }) => {
  // Estado inicial: si hay token guardado, intentamos cargar perfil
  const [token, setToken] = usePersistentState(TOKEN_KEY, {
    initialValue: null,
    parser: identity,
    serializer: identity,
  });
  const [user, setUser] = usePersistentState(USER_KEY, {
    initialValue: null,
    parser: safeParseJson,
    serializer: (value) => JSON.stringify(value),
  });
  const [status, setStatus] = useState(() => (token ? STATUS.LOADING : STATUS.IDLE));
  const [error, setError] = useState(null);

  // --- Sync helpers (token/user <-> storage + api-client) -------
  const syncToken = useCallback((nextToken) => {
    setTokenGetter(() => nextToken);           // api-client leerá el token actual
    setToken(nextToken ?? null);
  }, [setToken]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
  }, [setUser]);

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
        const profile = await authApi.profile(user?.id);
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
      try {
        const { token: nextToken, user: profile } = await authApi.login(credentials);
        syncToken(nextToken);
        syncUser(profile);
        setStatus(STATUS.AUTH);
        return profile;
      } catch (err) {
        setError(err);
        setStatus(STATUS.IDLE);
        throw err;
      }
    },
    [syncToken, syncUser],
  );

  const register = useCallback(
    async (payload) => {
      setStatus(STATUS.LOADING);
      setError(null);
      try {
        const response = await authApi.register(payload);
        const nextToken = response?.token ?? null;
        const profile = response?.user ?? null;
        syncToken(nextToken);
        syncUser(nextToken ? profile : null);
        setStatus(nextToken ? STATUS.AUTH : STATUS.IDLE);
        return response;
      } catch (err) {
        setError(err);
        setStatus(STATUS.IDLE);
        throw err;
      }
    },
    [syncToken, syncUser],
  );

  // para editar perfil
  const refreshProfile = useCallback(async () => {
    setStatus(STATUS.LOADING);
    setError(null);
    try {
      const profile = await authApi.profile(user?.id);
      syncUser(profile);
      setStatus(STATUS.AUTH);
      return profile;
    } catch (err) {
      setError(err);
      logout();
      throw err;
    }
  }, [syncUser, logout, user]);

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

// Re-export hooks/utilities to avoid breaking existing imports
// Nota: para usar hooks/utilidades importa desde "./auth-context.js"
// export { useAuth, isAdminRole } from "./auth-context.js";
