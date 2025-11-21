import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { setOnUnauthorized, setTokenGetter } from "@/services/api-client.js"
import { authApi } from "@/services/auth.api.js"
import { AuthContext, isAdminRole } from "@/context/auth-context.js"
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useNavigate } from "react-router-dom";
import { debugAuth } from "@/utils/clearAuth.js";

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
  const navigate = useNavigate();

  // --- Sync helpers (token/user <-> storage + api-client) -------
  const syncToken = useCallback((nextToken) => {
    console.log('[AuthContext] syncToken llamado, token:', nextToken);
    setTokenGetter(() => nextToken);           // api-client leerá el token actual
    setToken(nextToken ?? null);
  }, [setToken]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
  }, [setUser]);

  // --- Timeout de seguridad para evitar loader infinito ---
  useEffect(() => {
    if (status === STATUS.LOADING) {
      const timeout = setTimeout(() => {
        console.warn('[AuthContext] Timeout de carga alcanzado, forzando salida del loader');
        const authState = debugAuth(); // Debug para ver qué hay en localStorage
        console.log('[AuthContext] Estado actual:', authState);
        if (!token) {
          setStatus(STATUS.IDLE);
        } else if (!user) {
          // Si hay token pero no user después de 5 segundos, limpiar todo
          console.error('[AuthContext] Token presente pero sin usuario después del timeout, limpiando sesión');
          syncToken(null);
          syncUser(null);
          setStatus(STATUS.IDLE);
        }
      }, 5000); // 5 segundos de timeout
      return () => clearTimeout(timeout);
    }
  }, [status, token, user, syncToken, syncUser]);

  const logout = useCallback(() => {
    syncToken(null);
    syncUser(null);
    setStatus(STATUS.IDLE);
    setError(null);
    navigate("/", { replace: true });
  }, [syncToken, syncUser, navigate]);

  // api-client: define cómo actuar ante 401 global y cómo obtener token
  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(() => logout);
  }, [token, logout]);

  // Si hay token pero no user, intenta cargar perfil
  useEffect(() => {
    if (!token || user) {
      // Si no hay token o ya hay user, asegurarse de salir del loading
      if (status === STATUS.LOADING && !token) {
        setStatus(STATUS.IDLE);
      } else if (status === STATUS.LOADING && token && user) {
        setStatus(STATUS.AUTH);
      }
      return undefined;
    }
    
    let cancelled = false;

    (async () => {
      try {
        console.log('[AuthContext] Cargando perfil con token existente...');
        // No pasar user?.id porque user es null, usar endpoint /usuario que obtiene por token
        const profile = await authApi.profile();
        console.log('[AuthContext] Perfil cargado:', profile);
        if (cancelled) return;
        syncUser(profile);
        setStatus(STATUS.AUTH);
      } catch (err) {
        console.error('[AuthContext] Error cargando perfil:', err);
        if (cancelled) return;
        setError(err);
        logout();
      }
    })();

    return () => { cancelled = true; };
  }, [token, user, status, syncUser, logout]);

  // --- Acciones públicas ---------------------------------------
  const login = useCallback(
    async (credentials) => {
      setStatus(STATUS.LOADING);
      setError(null);
      try {
        console.log('[AuthContext] Intentando login con credenciales:', credentials);
        const { token: nextToken, user: profile } = await authApi.login(credentials);
        console.log('[AuthContext] Login exitoso, token:', nextToken, 'profile:', profile);
        syncToken(nextToken);
        syncUser(profile);
        setStatus(STATUS.AUTH);
        return profile;
      } catch (err) {
        console.error('[AuthContext] Error en login:', err);
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
      // No pasar user?.id, usar endpoint que obtiene perfil por token
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

  // Loader global mientras se inicializa el token y el usuario
  if (status === STATUS.LOADING && token && typeof token === 'string' && token.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl font-medium text-primary">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

