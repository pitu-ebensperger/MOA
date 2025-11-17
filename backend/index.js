import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import webhookController from "./src/controllers/webhookController.js";
import { errorHandler, AppError, NotFoundError } from "./src/utils/error.utils.js";

dotenv.config();

const app = express();

// Webhook de Stripe antes del parser JSON
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook
);

// Middleware global
app.use(express.json({ limit: '10mb' })); // Límite de payload
app.use(cors());

/* ----------------------------- Rutas ----------------------------- */

import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import home from "./routes/homeRoutes.js";

// Ruta base para tests
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "API funcionando",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Registro de rutas en orden de prioridad
app.use(home);              // Rutas home (/)
app.use(authRoutes);        // Rutas de autenticación (/login, /register, etc.)
app.use(userRoutes);        // Rutas de usuario (/usuario, /auth/perfil)
app.use(categoriesRouter);  // Rutas de categorías (/categorias)
app.use(productsRouter);    // Rutas de productos (/productos)
app.use(wishlistRoutes);    // Rutas de wishlist (/wishlist)
app.use(cartRoutes);        // Rutas de carrito (/cart)
app.use("/api", addressRoutes); // Rutas de direcciones (/api/addresses)
app.use(paymentRoutes);     // Rutas de pago (/payment)
app.use(orderRoutes);       // Rutas de órdenes (/orders)
app.use(adminRoutes);       // Rutas de admin (/admin/*)
app.use(configRoutes);      // Rutas de configuración (/config)

// Manejo de rutas no encontradas
app.all("*", (req, res, next) => {
  next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

export default app;

/*-- NOTA : Para correr backend ahora es "node server.js"--*/
