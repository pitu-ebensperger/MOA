import { useCallback, useEffect, useMemo, useState, useLayoutEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from "prop-types";
import { setOnUnauthorized, setTokenGetter } from "@/services/api-client.js"
import { authApi } from "@/services/auth.api.js"
import { AuthContext, isAdminRole } from "@/context/auth-context.js"
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useNavigate } from "react-router-dom";
import { observability } from '@/services/observability.js';
import { useSessionMonitor } from "@/hooks/useSessionMonitor.js";
import { SessionExpirationDialog } from "@/components/auth/SessionExpirationDialog.jsx";
import { Alert } from "@/components/ui/Alert.jsx";


// ---- Constantes y utilidades ----------------------------------
const TOKEN_KEY = "moa.accessToken";
const USER_KEY  = "moa.user";
const STATUS = { IDLE: "idle", LOADING: "loading", AUTH: "authenticated" };

const safeParseJson = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const identity = (value) => value;
const DEBUG_LOGS = import.meta.env?.VITE_DEBUG_LOGS === 'true';
const debugWarn = (...args) => { if (DEBUG_LOGS) console.warn(...args); };
const debugError = (...args) => { if (DEBUG_LOGS) console.error(...args); };

// ---- Contexto --------------------------------------------------
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
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
    persistNull: true, // Mantener en storage incluso cuando sea null para evitar limpiezas accidentales
  });
  
  // Estado inicial: determinar según lo que hay en localStorage
  const [status, setStatus] = useState(() => {
    // Si hay sesión completa guardada (token + user con ID), confiar en ella
    if (token && user && (user.id || user.usuario_id)) {
      return STATUS.AUTH;
    }
    // Si solo hay token sin user, será token inválido - limpiar en el useEffect
    if (token && !user) {
      debugWarn('[AuthContext] ⚠️ Token sin usuario detectado al iniciar');
      return STATUS.IDLE; // No mostrar loader, limpiar en background
    }
    // Sin sesión
    return STATUS.IDLE;
  });
  const [error, setError] = useState(null);
  const [showExpirationDialog, setShowExpirationDialog] = useState(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);
  const navigate = useNavigate();

  // --- Sync helpers (token/user <-> storage + api-client) -------
  const syncToken = useCallback((nextToken) => {
    setTokenGetter(() => nextToken);           // api-client leerá el token actual
    setToken(nextToken ?? null);
  }, [setToken]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
  }, [setUser]);

  // --- Limpieza preventiva al montar: si hay token huérfano (sin user), limpiarlo ---
  useLayoutEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    
    // Limpiar overflow:hidden del body por si quedó trabado
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }
    
    // Solo limpiar si realmente hay inconsistencia al inicio
    if (storedToken && !storedUser) {
      debugWarn('[AuthContext] ⚠️ Token huérfano detectado (sin user), limpiando localStorage...');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      syncToken(null);
      setStatus(STATUS.IDLE);
    } else if (!storedToken && storedUser) {
      debugWarn('[AuthContext] ⚠️ User huérfano detectado (sin token), limpiando localStorage...');
      localStorage.removeItem(USER_KEY);
      syncUser(null);
      setStatus(STATUS.IDLE);
    }
  }, [syncToken, syncUser]); // Dependencias estables para mantener limpieza inicial

  const logout = useCallback((reason = null) => {
    // Limpiar token y perfil
    syncToken(null);
    syncUser(null);
    setStatus(STATUS.IDLE);
    setError(null);
    setShowExpirationDialog(false);
    
    // Limpiar overflow:hidden del body por si quedó trabado
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
      document.body.style.removeProperty('overflow');
    }
    
    // Limpiar almacenamiento local inmediato (evita mostrar datos stale)
    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      debugWarn('[AuthContext] No se pudieron limpiar datos del storage', e);
    }
    // Limpiar cache de React Query para datos protegidos
    try {
      queryClient.clear();
    } catch (e) {
      debugWarn('[AuthContext] Error limpiando cache de QueryClient', e);
    }
    
    // Mostrar alerta de sesión expirada si es por expiración
    if (reason === 'expired') {
      setShowExpiredAlert(true);
      // Auto-ocultar después de 5 segundos
      setTimeout(() => setShowExpiredAlert(false), 5000);
    }
    
    // Redirigir según contexto: admin → login, otros → home
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.startsWith('/admin');
    
    if (isAdminPath || reason === 'expired') {
      navigate("/login", { replace: true, state: { from: currentPath, expired: reason === 'expired' } });
    } else {
      navigate("/", { replace: true });
    }
  }, [syncToken, syncUser, navigate, queryClient]);

  // api-client: define cómo actuar ante 401 global y cómo obtener token
  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(() => logout);
  }, [token, logout]);

  // Limpieza de emergencia: si status es IDLE, asegurar que no haya overlays trabados
  useEffect(() => {
    if (status === STATUS.IDLE && typeof document !== 'undefined') {
      // Limpiar overflow del body
      if (document.body) {
        document.body.style.overflow = '';
        document.body.style.removeProperty('overflow');
        document.body.classList.remove('overflow-hidden');
      }
      
      // Cerrar cualquier portal de Radix que pueda estar abierto
      const radixPortals = document.querySelectorAll('[data-radix-portal]');
      for (const portal of radixPortals) {
        if (portal?.parentNode) {
          portal.remove();
        }
      }
      
      // Remover overlays específicos que puedan estar trabados
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay], [data-radix-sheet-overlay]');
      for (const overlay of overlays) {
        if (overlay?.parentNode) {
          overlay.remove();
        }
      }
      
      // Remover cualquier div con z-index alto y position fixed que cubra la pantalla
      const suspiciousOverlays = document.querySelectorAll('div[class*="fixed"][class*="inset-0"][class*="z-"]');
      for (const overlay of suspiciousOverlays) {
        const classList = Array.from(overlay.classList);
        const hasHighZIndex = classList.some(cls => /z-\d{2,}/.test(cls) || /z-50/.test(cls));
        const hasOverlay = classList.some(cls => /bg-black|overlay|backdrop/.test(cls));
        
        if (hasHighZIndex && hasOverlay) {
          debugWarn('[AuthContext] Removiendo overlay sospechoso:', overlay.className);
          overlay.remove();
        }
      }
    }
  }, [status]);

  useEffect(() => {
    if (status === STATUS.AUTH && user && token) {
      observability.identifyUser(user);
    } else if (!token) {
      observability.clearUser();
    }
  }, [status, user, token]);

  // Si hay token pero no user, intenta cargar perfil (validación de sesión silenciosa)
  useEffect(() => {
    // Si ya hay user o no hay token, no hacer nada
    if (!token || user) {
      return undefined;
    }
    
    // Si hay token pero no user, intentar validar en background (sin bloquear UI)
    let cancelled = false;

    (async () => {
      try {
        const profile = await authApi.profile();
        if (cancelled) return;
        
        // Validar que el perfil tenga ID (identificador único requerido)
        if (!profile || !(profile.id || profile.usuario_id)) {
          debugError('[AuthContext] ❌ Perfil inválido: sin ID de usuario');
          throw new Error('Perfil inválido: sin ID de usuario');
        }
        
        syncUser(profile);
        setStatus(STATUS.AUTH);
      } catch (err) {
        if (cancelled) return;
        
        const is401 = err?.status === 401 || err?.message?.includes('401') || err?.message?.toLowerCase().includes('unauthorized');
        const isTokenInvalid = err?.message?.toLowerCase().includes('token') || err?.message?.toLowerCase().includes('sesión');
        
        if (is401 || isTokenInvalid) {
          debugError('[AuthContext] ❌ Token inválido o expirado, limpiando:', err.message);
        } else {
          debugError('[AuthContext] ❌ Error validando token:', err.message);
        }
        
        // Limpiar cualquier token inválido inmediatamente
        syncToken(null);
        syncUser(null);
        setStatus(STATUS.IDLE);
        setError(null); // No mostrar error, simplemente limpiar
      }
    })();

    return () => { cancelled = true; };
  }, [token, user, syncToken, syncUser]);

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
        debugError('[AuthContext] Error en login:', err);
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

  // Extender sesión (renovar token)
  const extendSession = useCallback(async () => {
    try {
      const { token: newToken, user: profile } = await authApi.refreshToken();
      syncToken(newToken);
      syncUser(profile);
      setShowExpirationDialog(false);
      return true;
    } catch (err) {
      debugError('[AuthContext] Error extendiendo sesión:', err);
      logout('expired');
      return false;
    }
  }, [syncToken, syncUser, logout]);

  // Handlers para el monitor de sesión
  const handleSessionExpired = useCallback(() => {
    debugWarn('[AuthContext] 🔒 Sesión expirada, cerrando...');
    logout('expired');
  }, [logout]);

  const handleSessionWarning = useCallback((minutesRemaining) => {
    debugWarn(`[AuthContext] ⚠️ Sesión expira en ${minutesRemaining} minutos`);
    // Solo mostrar warning si el usuario NO es admin (admin tiene 7 días)
    if (user && user.role_code !== 'ADMIN') {
      setShowExpirationDialog(true);
    }
  }, [user]);

  // Monitorear expiración del token
  useSessionMonitor({
    token,
    onExpired: handleSessionExpired,
    onWarning: handleSessionWarning,
    warningMinutes: 5, // Avisar 5 minutos antes
  });

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
      extendSession,
    }),
    [user, token, status, error, login, register, logout, refreshProfile, extendSession],
  );

  // Loader global solo si hay sesión completa cargándose (token + user guardados)
  // NO mostrar loader para tokens huérfanos (se validan en background)
  if (status === STATUS.LOADING && token && user) {
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
      
      {/* Diálogo de sesión por expirar */}
      <SessionExpirationDialog
        open={showExpirationDialog}
        minutesRemaining={5}
        onExtend={extendSession}
        onLogout={() => logout('expired')}
        onDismiss={() => setShowExpirationDialog(false)}
      />
      
      {/* Alerta de sesión expirada (fija en top) */}
      {showExpiredAlert && (
        <div className="fixed left-1/2 top-[80px] z-[var(--z-modal,1050)] w-full max-w-lg -translate-x-1/2 px-4">
          <Alert
            variant="warning"
            title="Sesión expirada"
            dismissible
            onDismiss={() => setShowExpiredAlert(false)}
            className="border-[color:var(--color-warning)]/50 bg-[var(--color-warning-veil)] backdrop-blur-md shadow-lg"
          >
            Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.
          </Alert>
        </div>
      )}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
