const rawEnv = {
  API_BASE_URL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT ?? 0) || undefined,
  NODE_ENV: import.meta.env.MODE ?? "development",
};

const normalizeEnv = (values) => ({
  API_BASE_URL: values.API_BASE_URL,
  API_TIMEOUT: values.API_TIMEOUT,
  NODE_ENV: values.NODE_ENV,
  IS_DEV: values.NODE_ENV === "development",
  IS_PROD: values.NODE_ENV === "production",
});

export const env = normalizeEnv(rawEnv);

