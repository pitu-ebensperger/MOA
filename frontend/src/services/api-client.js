import { env } from "@/config/env.js"

const DEFAULT_TIMEOUT = env.API_TIMEOUT ?? 15000;

// token + handler global 401 (los setea AuthContext)
let tokenGetter = () => null;
let onUnauthorized = null;

export function setTokenGetter(fn) {
  tokenGetter = typeof fn === "function" ? fn : () => null;
}

export function setOnUnauthorized(fn) {
  onUnauthorized = typeof fn === "function" ? fn : null;
}

// FormData/Blob/etc. no llevan JSON.stringify ni content-type json
const isRawBody =
  (data) =>
    (typeof FormData !== "undefined" && data instanceof FormData) ||
    (typeof Blob !== "undefined" && data instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer);

// Interceptor de mocks eliminado: todo va contra backend real.

const tryParseJson = (text) => {
  if (text === undefined || text === null || text === "") {
    return { ok: true, value: null };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: text };
  }
};

// Petición base (fetch)
async function request(path, { method = "GET", data, headers = {}, auth = null, timeout = DEFAULT_TIMEOUT, responseType = "json", params } = {}) {
  // Sin soporte de mocks: siempre solicitar al backend.

  const baseURL = env.API_BASE_URL;
  const url = new URL(path, baseURL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item === undefined || item === null) {
            return;
          }
          url.searchParams.append(key, String(item));
        });
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeout);

  const opts = {
    method,
    headers: { ...headers },
    signal: controller.signal,
  };

  // Body + content-type
  if (data !== undefined) {
    if (isRawBody(data)) {
      opts.body = data;
      // no seteamos Content-Type: el browser lo pone (boundary, etc.)
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = typeof data === "string" ? data : JSON.stringify(data);
    }
  }

  // Auto-detectar auth si no se especifica
  if (auth === null) {
    // Rutas que típicamente requieren autenticación
    const authRequiredPatterns = [
      /\/admin\//,
      /\/perfil/,
      /\/profile/,
      /\/carrito/,
      /\/cart/,
      /\/direcciones/,
      /\/addresses/,
      /\/pedidos/,
      /\/orders/,
      /\/usuario/,
      /\/user/,
      /\/checkout/, // agregar checkout para ordenes
    ];
    
    auth = authRequiredPatterns.some(pattern => pattern.test(path));
  }

  // Authorization si es cliente privado
  if (auth) {
    const token = tokenGetter?.();
    console.log('[api-client] Token usado para Authorization:', token);
    if (token && typeof token === 'string' && token.length > 0) {
      opts.headers.Authorization = `Bearer ${token}`;
      console.log('[api-client] Header Authorization:', opts.headers.Authorization);
    } else {
      console.warn('[api-client] No se envió el token en Authorization. Token:', token);
    }
  }

  let res;
  try {
    res = await fetch(url, opts);
  } finally {
    clearTimeout(timer);
  }

  // 204 No Content
  if (res.status === 204) return null;

  let payload;
  let rawText = "";
  let parsedJson = null;

  if (responseType === "blob") {
    const clone = res.clone();
    payload = await res.blob();
    rawText = await clone.text();
    parsedJson = tryParseJson(rawText);
  } else {
    rawText = await res.text();
    parsedJson = tryParseJson(rawText);
    if (responseType === "text") {
      payload = rawText;
    } else {
      payload = parsedJson.ok ? parsedJson.value : rawText;
    }
  }

  // 401 → dispara handler global (logout) si existe
  if (res.status === 401 && onUnauthorized) {
    try {
      onUnauthorized();
    } catch (handlerError) {
      console.error('onUnauthorized handler failed', handlerError);
    }
  }

  if (!res.ok) {
    const errorData = parsedJson?.ok ? parsedJson.value : rawText;
    const message = parsedJson?.ok && parsedJson.value?.message
      ? parsedJson.value.message
      : rawText || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }

  return payload;
}

// Cliente auxiliar para rutas públicas/privadas
const createSubClient = (authOverride) => ({
  get: (path, opts = {}) => request(path, { ...opts, method: "GET", auth: authOverride }),
  post: (path, data, opts = {}) => request(path, { ...opts, method: "POST", data, auth: authOverride }),
  put: (path, data, opts = {}) => request(path, { ...opts, method: "PUT", data, auth: authOverride }),
  patch: (path, data, opts = {}) => request(path, { ...opts, method: "PATCH", data, auth: authOverride }),
  delete: (path, opts = {}) => request(path, { ...opts, method: "DELETE", auth: authOverride }),
});

// Cliente API simple con auto-detección de autenticación
export const apiClient = {
  get:    (path, opts = {})       => request(path, { ...opts, method: "GET" }),
  post:   (path, data, opts = {}) => request(path, { ...opts, method: "POST", data }),
  put:    (path, data, opts = {}) => request(path, { ...opts, method: "PUT", data }),
  patch:  (path, data, opts = {}) => request(path, { ...opts, method: "PATCH", data }),
  delete: (path, opts = {})       => request(path, { ...opts, method: "DELETE" }),
  public: createSubClient(false),
  private: createSubClient(true),
};
