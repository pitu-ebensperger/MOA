import { findUserModel } from "../models/usersModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import "dotenv/config";
import { AppError, NotFoundError, UnauthorizedError } from "../utils/error.utils.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserModel(email);
    if (!user) {
      throw new UnauthorizedError("No autorizado");
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("No autorizado");
    }
    if (!JWT_SECRET) {
      throw new AppError("JWT secret no configurado", 500);
    }
    const token = jwt.sign(
      { id: user.usuario_id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        role_code: user.role_code,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const email = req.user;
    if (!email) {
      throw new UnauthorizedError("No autorizado");
    }
    const user = await findUserModel(email);

    if (!user) {
      throw new NotFoundError("Usuario");
    }

    const profile = {
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      role_code: user.role_code,
    };

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
