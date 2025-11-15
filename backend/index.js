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

app.use("/categories", categoriesRouter);
app.use(userRoutes);
app.use(authRoutes);

