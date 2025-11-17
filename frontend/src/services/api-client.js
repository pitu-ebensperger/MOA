import { env } from "@/config/env.js"
import { mockAuthApi } from "@/mocks/api/auth.js"
import { mockCartApi } from "@/mocks/api/cart.js"
import { analyticsData } from "@/mocks/analytics.data.js"

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

// Mock interceptor
function tryMockRoute(path, method, data) {
  if (!env.USE_MOCKS) return null;

  // Auth routes - corregidas para coincidir con API_PATHS
  if ((path.includes('/auth/login') || path.includes('/login')) && method === 'POST') {
    return mockAuthApi.login(data);
  }
  if ((path.includes('/auth/register') || path.includes('/registro')) && method === 'POST') {
    return mockAuthApi.register(data);
  }
  if (path.includes('/auth/profile') || path.includes('/perfil')) {
    // Extraer userId de la URL si está disponible
    const userIdMatch = path.match(/\/perfil\/([^/]+)|\/profile\/([^/]+)/);
    const userId = userIdMatch?.[1] || userIdMatch?.[2];
    return mockAuthApi.profile(userId);
  }
  if (path.includes('/auth/forgot-password') || path.includes('/olvidaste-contrasena')) {
    return mockAuthApi.requestPasswordReset(data.email);
  }
  if (path.includes('/auth/reset-password') || path.includes('/restablecer-contrasena')) {
    return mockAuthApi.resetPassword();
  }

  // Cart routes
  const cartMatch = path.match(/\/carrito\/([^/]+)/);
  if (cartMatch) {
    const userId = cartMatch[1];
    
    if (method === 'GET') {
      return mockCartApi.getCart(userId);
    }
    if (path.includes('/items') && method === 'POST') {
      return mockCartApi.addItem(userId, data);
    }
    
    const itemMatch = path.match(/\/items\/([^/]+)/);
    if (itemMatch) {
      const itemId = itemMatch[1];
      if (method === 'PUT') {
        return mockCartApi.updateItem(userId, itemId, data.quantity);
      }
      if (method === 'DELETE') {
        return mockCartApi.removeItem(userId, itemId);
      }
    }
    
    if (method === 'DELETE') {
      return mockCartApi.clearCart(userId);
    }
  }

  // Analytics routes
  if (path.includes('/admin/analytics/dashboard') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.dashboardMetrics), 300);
    });
  }
  if (path.includes('/admin/analytics/sales') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.salesAnalytics), 350);
    });
  }
  if (path.includes('/admin/analytics/conversion') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.conversionMetrics), 280);
    });
  }
  if (path.includes('/admin/analytics/products/top') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.topProducts), 320);
    });
  }
  if (path.includes('/admin/analytics/categories') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.categoryAnalytics), 290);
    });
  }
  if (path.includes('/admin/analytics/stock') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.stockAnalytics), 250);
    });
  }
  if (path.includes('/admin/analytics/orders/distribution') && method === 'GET') {
    return new Promise(resolve => {
      setTimeout(() => resolve(analyticsData.orderDistribution), 310);
    });
  }

  return null;
}

// Petición base (fetch)
async function request(path, { method = "GET", data, headers = {}, auth = null, timeout = DEFAULT_TIMEOUT } = {}) {
  // Intentar usar mock primero
  const mockResult = tryMockRoute(path, method, data);
  if (mockResult !== null) {
    return await mockResult;
  }

  const baseURL = env.API_BASE_URL;
  const url = new URL(path, baseURL);

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
      /\/metodos-pago/,
      /\/payment/,
      /\/usuario/,
      /\/user/,
    ];
    
    auth = authRequiredPatterns.some(pattern => pattern.test(path));
  }

  // Authorization si es cliente privado
  if (auth) {
    const token = tokenGetter?.();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, opts);
  } finally {
    clearTimeout(timer);
  }

  // 204 No Content
  if (res.status === 204) return null;

  // Parse seguro
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
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
    const err = new Error(payload?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = payload;
    throw err;
  }

  return payload;
}

// Cliente API simple con auto-detección de autenticación
export const apiClient = {
  get:    (path, opts = {})       => request(path, { ...opts, method: "GET" }),
  post:   (path, data, opts = {}) => request(path, { ...opts, method: "POST", data }),
  put:    (path, data, opts = {}) => request(path, { ...opts, method: "PUT", data }),
  patch:  (path, data, opts = {}) => request(path, { ...opts, method: "PATCH", data }),
  delete: (path, opts = {})       => request(path, { ...opts, method: "DELETE" }),
};
