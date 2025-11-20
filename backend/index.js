import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, NotFoundError } from "./src/utils/error.utils.js";

dotenv.config();

const app = express();

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
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
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
app.use(orderRoutes);       // Rutas de órdenes (/orders)
app.use(addressRoutes);     // Rutas de direcciones (/api/direcciones)
app.use(adminRoutes);       // Rutas de admin (/admin/*)
app.use(configRoutes);      // Rutas de configuración (/config)

// Manejo de rutas no encontradas - debe estar después de todas las rutas
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

export default app;
