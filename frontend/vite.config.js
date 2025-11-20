import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = (env.VITE_API_URL ?? "http://localhost:4000").trim();
  const apiProxyPaths = [
    "/auth",
    "/login",
    "/cart",
    "/wishlist",
    "/direcciones",
    "/home",
    "/categorias",
    "/productos",
    "/producto",
    "/admin",
    "/pedidos",
    "/orders",
    "/payment",
    "/metodos-pago",
    "/usuario",
    "/user",
    "/config",
    "/api",
  ];

  const createProxyConfig = () => ({
    target: apiProxyTarget,
    changeOrigin: true,
    secure: false,
    // Allow the dev server to serve HTML routes directly (avoid proxying `/login`, `/admin`, etc.)
    bypass(req) {
      if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
        return "/index.html"
      }
      return undefined
    },
  })

  const proxy = Object.fromEntries(
    apiProxyPaths.map((pathname) => [pathname, createProxyConfig()]),
  )

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config'),
      },
    },
    server: {
      proxy,
    },
  };
})
