import pool from "../config.js";
import { WISHLISTS, WISHLIST_ITEMS } from "./wishlistData.js";

async function seedWishlists() {
  try {
    for (const list of WISHLISTS) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [list.userId]
      );

      if (!userRes.rowCount) {
        console.warn(`Usuario '${list.userId}' no encontrado para wishlist '${list.id}'`);
        continue;
      }

      const usuarioId = userRes.rows[0].usuario_id;
      const wishlistRes = await pool.query(
        `
        INSERT INTO wishlists (usuario_id)
          VALUES ($1)
        ON CONFLICT (usuario_id) DO NOTHING
        RETURNING wishlist_id
      `,
        [usuarioId]
      );

      const wishlistId =
        wishlistRes.rowCount > 0
          ? wishlistRes.rows[0].wishlist_id
          : (
              await pool.query("SELECT wishlist_id FROM wishlists WHERE usuario_id = $1", [usuarioId])
            ).rows[0].wishlist_id;

      const items = WISHLIST_ITEMS.filter((item) => item.wishlistId === list.id);

      for (const item of items) {
        const productRes = await pool.query(
          "SELECT producto_id FROM productos WHERE slug = $1",
          [item.productSlug]
        );

        if (!productRes.rowCount) {
          console.warn(`Producto '${item.productSlug}' no encontrado para wishlist`);
          continue;
        }

        const productoId = productRes.rows[0].producto_id;
        await pool.query(
          `
          INSERT INTO wishlist_items (wishlist_id, producto_id)
            VALUES ($1, $2)
          ON CONFLICT (wishlist_id, producto_id) DO NOTHING
        `,
          [wishlistId, productoId]
        );
      }
    }

    console.log("Wishlists sincronizadas");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar wishlists:", error);
    process.exit(1);
  }
}

seedWishlists();
