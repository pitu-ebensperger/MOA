import pool from "../config.js";
import { ADDRESSES } from "./addressesData.js";

async function seedDirecciones() {
  try {
    for (const address of ADDRESSES) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [address.userId]
      );

      if (!userRes.rowCount) {
        console.warn(`Usuario '${address.userId}' no encontrado para la dirección '${address.externalId}'`);
        continue;
      }

      const usuarioId = userRes.rows[0].usuario_id;
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
