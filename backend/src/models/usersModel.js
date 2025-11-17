import { pool } from "../../database/config.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const createUserModel = async (nombre, email, telefono, password) => {
  const publicId = nanoid();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sqlQuery = {
    text: `
        INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING usuario_id, public_id, nombre, email, telefono, creado_en
        `,
    values: [publicId, nombre, email, telefono, hashedPassword],
  };

  const response = await pool.query(sqlQuery);
  return response.rows[0];
};

export const findUserModel = async (email) => {
  const sqlQuery = {
    text: "SELECT * FROM usuarios WHERE email = $1",
    values: [email],
  };
  const response = await pool.query(sqlQuery);
  return response.rows[0];
};

export const getUserByIdModel = async (id) => {
  const sqlQuery = {
    text: `
      SELECT 
        usuario_id AS id,
        public_id AS "publicId",
        nombre,
        email,
        telefono,
        rol,
        rol_code AS "rolCode",
        creado_en AS "createdAt"
      FROM usuarios
      WHERE usuario_id = $1
    `,
    values: [id],
  };

  const response = await pool.query(sqlQuery);
  return response.rows[0];
};

export const updateUserModel = async ({ id, nombre, telefono }) => {
  const sqlQuery = {
    text: `
      UPDATE usuarios
      SET nombre = $1,
          telefono = $2
      WHERE usuario_id = $3
      RETURNING usuario_id AS id, nombre, email, telefono, creado_en AS "createdAt"
    `,
    values: [nombre, telefono, id],
  };

  const response = await pool.query(sqlQuery);
  return response.rows[0];
};
