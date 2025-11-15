import { findUserModel } from "../models/usersModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET;

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserModel(email);
    if (!user) {
      return res.status(401).json({ message: "no autorizado" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "no autorizado" });
    }
    if (!JWT_SECRET) {
      throw new Error("JWT secret no configurado");
    }
    const token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res
      .status(200)
      .json({
        token,
        user: {
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol,
          role_code: user.role_code,
        },
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const email = req.user;
    const user = await findUserModel(email);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const filteredUser = {
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
    };
    res.status(200).json([filteredUser]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};
