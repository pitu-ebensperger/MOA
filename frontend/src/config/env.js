const base = import.meta.env;
const mode = base.MODE ?? "development";

export const env = {
  API_BASE_URL: (base.VITE_API_URL ?? "http://localhost:3000").trim(),
  API_TIMEOUT: Number(base.VITE_API_TIMEOUT) || undefined,
  USE_MOCKS: String(base.VITE_USE_MOCKS ?? "true").trim().toLowerCase() === "true",
  NODE_ENV: mode,
  IS_DEV: mode === "development",
  IS_PROD: mode === "production",
};
