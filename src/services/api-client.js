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
