import { pool } from "../../database/config.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const createUserModel = async (nombre, email, telefono, password, status = "activo") => {
  const publicId = nanoid();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const defaultRole = "user";
  const defaultRoleCode = "USER";

  const sqlQuery = {
    text: `
        INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING usuario_id, public_id, nombre, email, telefono, rol, rol_code, status, creado_en
        `,
    values: [publicId, nombre, email, telefono, hashedPassword, defaultRole, defaultRoleCode, status],
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
        status,
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

export const createAdminCustomerModel = async ({
  nombre,
  email,
  telefono = null,
  rol = "cliente",
  password,
  status = "activo",
}) => {
  const publicId = nanoid();
  const rawPassword = password || nanoid(12);
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  const sqlQuery = {
    text: `
      INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING usuario_id AS id, public_id AS "publicId", nombre, email, telefono, rol, rol_code AS "rolCode", status, creado_en AS "createdAt"
    `,
    values: [publicId, nombre, email, telefono, hashedPassword, rol, rol, status],
  };

  const response = await pool.query(sqlQuery);
  return response.rows[0];
};

export const updateAdminCustomerModel = async ({
  id,
  nombre,
  email,
  telefono,
  rol,
  status,
}) => {
  const sets = [];
  const values = [];

  if (nombre !== undefined) {
    sets.push(`nombre = $${values.length + 1}`);
    values.push(nombre);
  }

  if (email !== undefined) {
    sets.push(`email = $${values.length + 1}`);
    values.push(email);
  }

  if (telefono !== undefined) {
    sets.push(`telefono = $${values.length + 1}`);
    values.push(telefono);
  }

  if (status !== undefined) {
    sets.push(`status = $${values.length + 1}`);
    values.push(status);
  }

  if (rol !== undefined) {
    sets.push(`rol = $${values.length + 1}`);
    sets.push(`rol_code = $${values.length + 2}`);
    values.push(rol, rol);
  }

  if (!sets.length) {
    return null;
  }

  const query = {
    text: `
      UPDATE usuarios
      SET ${sets.join(", ")}
      WHERE usuario_id = $${values.length + 1}
      RETURNING usuario_id AS id, public_id AS "publicId", nombre, email, telefono, rol, rol_code AS "rolCode", status, creado_en AS "createdAt"
    `,
    values: [...values, id],
  };

  const response = await pool.query(query);
  return response.rows[0];
};
