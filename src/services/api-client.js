import { env } from "../config/env.js";

const DEFAULT_TIMEOUT = env.API_TIMEOUT ?? 15000;

let getAccessToken = () => null;
let onUnauthorized = null;

export const setTokenGetter = (fn) => {
  getAccessToken = typeof fn === "function" ? fn : () => null;
};
export const setOnUnauthorized = (fn) => {
  onUnauthorized = typeof fn === "function" ? fn : null;
};

const isRawBody = (data) =>
  (typeof FormData !== "undefined" && data instanceof FormData) ||
  (typeof Blob !== "undefined" && data instanceof Blob) ||
  (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) ||
  (typeof URLSearchParams !== "undefined" && data instanceof URLSearchParams) ||
  (typeof ReadableStream !== "undefined" && data instanceof ReadableStream);

const buildUrl = (base, path, query) => {
  const url = new URL(path, base);
  if (query && typeof query === "object") {
    const search = new URLSearchParams(url.search); // conserva params existentes
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) search.append(k, String(v));
    });
    if ([...search].length) url.search = search.toString();
  }
  return url.toString();
};

const parseResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return "";
  }
};

async function request(path, {
  method = "GET",
  data,
  headers = {},
  query,
  timeout = DEFAULT_TIMEOUT,
  auth = false,
  parseJson = true,
  signal,
} = {}) {
  const controller = new AbortController();
  const timer = timeout ? setTimeout(() => controller.abort(), timeout) : null;
  let externalAbortListener;

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      externalAbortListener = () => controller.abort(signal.reason);
      signal.addEventListener("abort", externalAbortListener);
    }
  }

  const finalHeaders = { ...headers };
  let body;

  if (data !== undefined) {
    if (isRawBody(data)) {
      body = data;
    } else {
      body = JSON.stringify(data);
      if (!finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
      }
    }
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(env.API_BASE_URL, path, query);

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body,
      signal: controller.signal,
      credentials: "include", // si tu backend usa cookies; quítalo si no
    });

    const payload = parseJson ? await parseResponse(res) : null;

    if (!res.ok) {
      const err = new Error(
        (payload && (payload.message || payload.error)) || `HTTP ${res.status}`,
      );
      err.status = res.status;
      err.payload = payload;
      if (res.status === 401 && onUnauthorized) onUnauthorized(err);
      throw err;
    }

    return payload;
  } finally {
    if (timer) clearTimeout(timer);
    if (signal && externalAbortListener) {
      signal.removeEventListener("abort", externalAbortListener);
    }
  }
}

const verbs = (auth = false) => ({
  get:   (path, opts = {})               => request(path, { ...opts, method: "GET", auth }),
  post:  (path, data, opts = {})         => request(path, { ...opts, method: "POST", data, auth }),
  put:   (path, data, opts = {})         => request(path, { ...opts, method: "PUT", data, auth }),
  patch: (path, data, opts = {})         => request(path, { ...opts, method: "PATCH", data, auth }),
  delete:(path, opts = {})               => request(path, { ...opts, method: "DELETE", auth }),
});

export const apiClient = {
  public: verbs(false),
  private: verbs(true),
};


// Ligero wrapper sobre fetch con 2 clientes: public/private.
// Expone setTokenGetter() y setOnUnauthorized() para integrarse con AuthContext.

let tokenGetter = () => null;
let onUnauthorized = null;

/** Permite que AuthContext registre cómo obtener el token actual */
export function setTokenGetter(fn) { tokenGetter = fn || (() => null); }
/** Permite que AuthContext registre qué hacer ante 401 (p.ej., logout) */
export function setOnUnauthorized(fn) { onUnauthorized = fn || null; }

const defaultHeaders = { 'Content-Type': 'application/json' };

async function request(baseURL, path, { method = 'GET', body, headers = {}, auth = false } = {}) {
  const opts = { method, headers: { ...defaultHeaders, ...headers } };
  if (body !== undefined) opts.body = typeof body === 'string' ? body : JSON.stringify(body);

  // Header Authorization si es cliente privado
  if (auth) {
    const token = tokenGetter?.();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(new URL(path, baseURL), opts);

  // 204 No Content
  if (res.status === 204) return null;

  // Parse JSON seguro
  let data;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  // 401 → dispara handler global si existe
  if (res.status === 401 && onUnauthorized) {
    try { onUnauthorized(); } catch {}
  }

  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

function createClient(baseURL) {
  return {
    get:    (path, cfg={}) => request(baseURL, path, { ...cfg, method: 'GET' }),
    post:   (path, body, cfg={}) => request(baseURL, path, { ...cfg, method: 'POST', body }),
    put:    (path, body, cfg={}) => request(baseURL, path, { ...cfg, method: 'PUT', body }),
    patch:  (path, body, cfg={}) => request(baseURL, path, { ...cfg, method: 'PATCH', body }),
    delete: (path, cfg={}) => request(baseURL, path, { ...cfg, method: 'DELETE' }),
  };
}

// Lee tu env actual (ya tenías env.js y API_PATHS)
import { env } from '../config/env.js';

const baseURL = env.API_BASE_URL;
export const apiClient = {
  public:  createClient(baseURL),                            // sin Authorization
  private: {
    get:    (p, c) => request(baseURL, p, { ...c, method:'GET',    auth:true }),
    post:   (p, b, c) => request(baseURL, p, { ...c, method:'POST', body:b, auth:true }),
    put:    (p, b, c) => request(baseURL, p, { ...c, method:'PUT',  body:b, auth:true }),
    patch:  (p, b, c) => request(baseURL, p, { ...c, method:'PATCH',body:b, auth:true }),
    delete: (p, c) => request(baseURL, p, { ...c, method:'DELETE',  auth:true }),
  },
};
