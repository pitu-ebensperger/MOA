import jwt from "jsonwebtoken";

import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET;

export const verifyToken = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "Configuración JWT incompleta" });
    }
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).json({ message: "El token debe estar presente" });
    }
    const extractToken = token.split(" ")[1];
    const decoded = jwt.verify(extractToken, JWT_SECRET);
    req.user = decoded.email;
    next();
  } catch (error) {
    return res.status(400).json({ message: "El token no es válido" });
  }
};
