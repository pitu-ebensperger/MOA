import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setOnUnauthorized, setTokenGetter } from "../../../services/api-client.js";
import { authApi } from "../services/auth.api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "moa.accessToken";
const USER_KEY = "moa.user";

const safeParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const storage = {
  get: (key) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  set: (key, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  remove: (key) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => storage.get(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = storage.get(USER_KEY);
    return raw ? safeParseJson(raw) : null;
  });
  const [status, setStatus] = useState("idle"); // idle | loading | authenticated
  const [error, setError] = useState(null);

  const syncToken = useCallback((nextToken) => {
    setTokenGetter(() => nextToken);
    if (nextToken) {
      storage.set(TOKEN_KEY, nextToken);
    } else {
      storage.remove(TOKEN_KEY);
    }
    setToken(nextToken);
  }, []);

  const syncUser = useCallback((nextUser) => {
    if (nextUser) {
      storage.set(USER_KEY, JSON.stringify(nextUser));
    } else {
      storage.remove(USER_KEY);
    }
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    syncToken(null);
    syncUser(null);
    setStatus("idle");
    setError(null);
  }, [syncToken, syncUser]);

  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(() => logout);
  }, [token, logout]);

  useEffect(() => {
    if (!token || user) return undefined;
    let cancelled = false;

    (async () => {
      setStatus("loading");
      try {
        const profile = await authApi.profile();
        if (cancelled) return;
        syncUser(profile);
        setStatus("authenticated");
      } catch (err) {
        if (cancelled) return;
        setError(err);
        logout();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user, syncUser, logout]);

  const login = useCallback(
    async (credentials) => {
      setStatus("loading");
      setError(null);
      try {
        const { token: nextToken, user: profile } = await authApi.login(credentials);
        syncToken(nextToken);
        syncUser(profile);
        setStatus("authenticated");
      } catch (err) {
        setError(err);
        setStatus("idle");
        throw err;
      }
    },
    [syncToken, syncUser],
  );

  const register = useCallback(
    async (payload) => {
      setStatus("loading");
      setError(null);
      try {
        const { token: nextToken, user: profile } = await authApi.register(payload);
        syncToken(nextToken);
        syncUser(profile);
        setStatus("authenticated");
      } catch (err) {
        setError(err);
        setStatus("idle");
        throw err;
      }
    },
    [syncToken, syncUser],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, token, status, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
};
