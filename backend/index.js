import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

/* ---------------------------- Rutas ---------------------------- */
import home from "./routes/homeRoutes.js";
import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { errorHandler } from "./src/utils/error.utils.js";

// Rutas
app.use(home);
app.use(authRoutes);
app.use(userRoutes);
app.use(categoriesRouter);
app.use(productsRouter);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(errorHandler);
app.use(wishlistRoutes);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

export default app;
