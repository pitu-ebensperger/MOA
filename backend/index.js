import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


let PORT = process.env.PORT || 4000;
app.listen(PORT, () => { console.log(`Servidor corriendo en puerto ${PORT}`);
});


/* ----------------------------------------------------------------------------------------------------------- */

import categoriesRouter from "./routes/categoriesRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Rutas montadas sin prefijos para alinearse con los paths del frontend
// (frontend espera /categorias, /login, /registro, /auth/perfil, etc.)
app.use(categoriesRouter); // GET /categorias
app.use(productsRoutes);   // GET /productos, GET /producto/:id (stubs)
app.use(homeRoutes);       // GET /home (stub)
app.use(adminRoutes);      // GET /admin/pedidos*, protegido (stubs)
app.use(userRoutes);       // POST /registro
app.use(authRoutes);       // POST /login, GET /auth/perfil, GET /usuarios

