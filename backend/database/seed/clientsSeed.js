import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import pool from "../config.js";
import { CLIENTS } from "./clientsData.js";

const DEFAULT_PASSWORD = process.env.CLIENTS_PASSWORD || "Cliente123!";

const normalizeClient = (client) => {
  const rol = (client.rol || "cliente").toLowerCase();
  const rolCode = client.rolCode || rol.toUpperCase();
  const status = (client.status || "activo").toLowerCase();
  return {
    ...client,
    rol,
    rolCode,
    status,
    password: client.password || DEFAULT_PASSWORD,
  };
};

async function seedClients() {
  try {
    for (const client of CLIENTS) {
      const normalized = normalizeClient(client);
      const passwordHash = bcrypt.hashSync(normalized.password, 10);
      const publicId = normalized.publicId || nanoid();

      const query = `
        INSERT INTO usuarios (
          public_id,
          nombre,
          email,
          telefono,
          password_hash,
          rol,
          rol_code,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          telefono = EXCLUDED.telefono,
          password_hash = EXCLUDED.password_hash,
          rol = EXCLUDED.rol,
          rol_code = EXCLUDED.rol_code,
          status = EXCLUDED.status
        RETURNING usuario_id;
      `;
      const values = [
        publicId,
        normalized.nombre,
        normalized.email,
        normalized.telefono,
        passwordHash,
        normalized.rol,
        normalized.rolCode,
        normalized.status,
      ];

      const result = await pool.query(query, values);
      console.log(`Cliente asegurado: ${normalized.email} → ID ${result.rows[0].usuario_id}`);
    }
    console.log("Seed de clientes completado correctamente.");
  } catch (error) {
    console.error("Error al insertar clientes:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedClients();
