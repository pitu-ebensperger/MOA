import bcrypt from "bcryptjs";
import pool from "../config.js";
import { CUSTOMERS } from "./customersData.js";

const DEFAULT_CUSTOMER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "ClienteMOA123!";
const passwordHash = bcrypt.hashSync(DEFAULT_CUSTOMER_PASSWORD, 10);

async function seedCustomers() {
  try {
    for (const customer of CUSTOMERS) {
      const sql = `
        INSERT INTO usuarios (
          public_id, nombre, email, telefono,
          password_hash, rol, rol_code, creado_en
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, now()))
        ON CONFLICT (email) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          telefono = EXCLUDED.telefono,
          password_hash = EXCLUDED.password_hash,
          rol = EXCLUDED.rol,
          rol_code = EXCLUDED.rol_code
      `;

      const values = [
        customer.publicId,
        customer.nombre,
        customer.email,
        customer.telefono,
        passwordHash,
        "cliente",
        "CLIENTE",
        customer.creadoEn,
      ];

      await pool.query(sql, values);
    }

    console.log("Usuarios de clientes insertados/actualizados correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar usuarios de clientes:", error);
    process.exit(1);
  }
}

seedCustomers();
