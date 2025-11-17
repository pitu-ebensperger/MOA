import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

/* ----------------------------------------------------------------------------------------------------------- */

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
import { errorHandler } from "./src/utils/error.utils.js";
import home from "./routes/homeRoutes.js";

app.use(categoriesRouter);
app.use(productsRouter);
app.use(userRoutes);
app.use(authRoutes);
app.use("/api", addressRoutes);
app.use(paymentRoutes);
app.use(orderRoutes);
app.use(configRoutes);

app.use(errorHandler);
app.use(home);
app.use(wishlistRoutes);
app.use(cartRoutes);

export default app;
