import { env } from "../config/env.js";

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

// Petición base (fetch)
async function request(path, { method = "GET", data, headers = {}, auth = false, timeout = DEFAULT_TIMEOUT } = {}) {
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

// Factories de verbos con/ sin auth
const verbs = (auth) => ({
  get:    (path, opts = {})       => request(path, { ...opts, method: "GET",    auth }),
  post:   (path, data, opts = {}) => request(path, { ...opts, method: "POST",   data, auth }),
  put:    (path, data, opts = {}) => request(path, { ...opts, method: "PUT",    data, auth }),
  patch:  (path, data, opts = {}) => request(path, { ...opts, method: "PATCH",  data, auth }),
  delete: (path, opts = {})       => request(path, { ...opts, method: "DELETE", auth }),
});

// Cliente listo para usar
export const apiClient = {
  public:  verbs(false),
  private: verbs(true),
};
