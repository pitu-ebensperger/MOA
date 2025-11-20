import pool from "../config.js";
import { ADDRESSES } from "./addressesData.js";

async function seedAddresses() {
  try {
    const emails = [...new Set(ADDRESSES.map((address) => address.email))];
    if (!emails.length) {
      console.log("No hay direcciones definidas para insertar.");
      return;
    }

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );

    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    const userIds = users.map((user) => user.usuario_id);
    if (userIds.length) {
      await pool.query(
        "DELETE FROM direcciones WHERE usuario_id = ANY($1)",
        [userIds],
      );
    }

    for (const address of ADDRESSES) {
      const userId = userMap.get(address.email);
      if (!userId) continue;

      await pool.query(
        `
          INSERT INTO direcciones (
            usuario_id,
            nombre_contacto,
            telefono_contacto,
            calle,
            numero,
            departamento,
            comuna,
            ciudad,
            region,
            codigo_postal,
            referencia,
            es_predeterminada
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        `,
        [
          userId,
          address.contactName,
          address.contactPhone,
          address.street,
          address.number,
          address.apartment,
          address.commune,
          address.city,
          address.region,
          address.postalCode,
          address.reference,
          address.isDefault ?? false,
        ],
      );
      console.log(`Dirección insertada para ${address.email} (${address.label})`);
    }

    console.log("Seed de direcciones completado.");
  } catch (error) {
    console.error("Error al insertar direcciones:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAddresses();
