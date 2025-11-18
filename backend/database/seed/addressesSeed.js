import pool from "../config.js";
import { ADDRESSES } from "./addressesData.js";
import { CUSTOMERS } from "./customersData.js";
import { CUSTOMER_PASSWORD_HASH } from "./passwordUtils.js";

const customerLookup = new Map(
  CUSTOMERS.map((customer) => [customer.publicId, customer])
);

async function ensureCustomerUsuario(publicId) {
  const customer = customerLookup.get(publicId);
  if (!customer) return null;

  try {
    const insertResult = await pool.query(
      `
      INSERT INTO usuarios (
        public_id, nombre, email, telefono,
        password_hash, rol, rol_code, creado_en
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, COALESCE($8, now())
      )
      ON CONFLICT (public_id) DO NOTHING
      RETURNING usuario_id
    `,
      [
        customer.publicId,
        customer.nombre,
        customer.email,
        customer.telefono,
        CUSTOMER_PASSWORD_HASH,
        "cliente",
        "CLIENTE",
        customer.creadoEn,
      ]
    );

    if (insertResult.rowCount) {
      return insertResult.rows[0].usuario_id;
    }

    const existing = await pool.query(
      "SELECT usuario_id FROM usuarios WHERE public_id = $1",
      [publicId]
    );

    return existing.rows[0]?.usuario_id ?? null;
  } catch (error) {
    console.error(
      `Error creando el usuario '${publicId}' antes de insertar direcciones:`,
      error.message
    );
    return null;
  }
}

async function seedDirecciones() {
  try {
    for (const address of ADDRESSES) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [address.userId]
      );

      let usuarioId = userRes.rowCount
        ? userRes.rows[0].usuario_id
        : await ensureCustomerUsuario(address.userId);

      if (!usuarioId) {
        console.warn(`Usuario '${address.userId}' no encontrado para la dirección '${address.externalId}'`);
        continue;
      }
      const existing = await pool.query(
        `
        SELECT direccion_id FROM direcciones
          WHERE usuario_id = $1 AND etiqueta = $2 AND calle = $3
      `,
        [usuarioId, address.etiqueta, address.calle]
      );

      const values = [
        usuarioId,
        address.etiqueta,
        address.calle,
        address.numero,
        address.deptoOficina,
        address.comuna,
        address.ciudad,
        address.region,
        address.codigoPostal,
        address.pais,
        address.telefono,
        address.instruccionesEntrega,
        address.esPredeterminada,
      ];

      if (existing.rowCount) {
        await pool.query(
          `
          UPDATE direcciones SET
            numero = $4, depto_oficina = $5, comuna = $6,
            ciudad = $7, region = $8, codigo_postal = $9,
            pais = $10, telefono_contacto = $11,
            instrucciones_entrega = $12, es_predeterminada = $13,
            actualizado_en = now()
          WHERE direccion_id = $14
        `,
          [...values, existing.rows[0].direccion_id]
        );
        continue;
      }

      await pool.query(
        `
        INSERT INTO direcciones (
          usuario_id, etiqueta, calle, numero, depto_oficina,
          comuna, ciudad, region, codigo_postal, pais,
          telefono_contacto, instrucciones_entrega, es_predeterminada
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `,
        values
      );
    }

    console.log("Direcciones sincronizadas correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar direcciones:", error);
    process.exit(1);
  }
}

seedDirecciones();
