import pool from "../config.js";
import { WISHLISTS } from "./wishlistData.js";

async function seedWishlists() {
  try {
    const emails = [...new Set(WISHLISTS.map((item) => item.email))];
    if (!emails.length) {
      console.log("No hay wishlists definidas.");
      return;
    }

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );
    if (!users.length) {
      console.log("No se encontraron usuarios para las wishlists.");
      return;
    }

    const userIds = users.map((user) => user.usuario_id);
    await pool.query(
      `DELETE FROM wishlist_items WHERE wishlist_id IN (SELECT wishlist_id FROM wishlists WHERE usuario_id = ANY($1))`,
      [userIds],
    );
    await pool.query("DELETE FROM wishlists WHERE usuario_id = ANY($1)", [userIds]);

    const slugs = WISHLISTS.flatMap((list) => list.items);
    const { rows: products } = await pool.query(
      `SELECT producto_id, slug FROM productos WHERE slug = ANY($1)`,
      [slugs],
    );
    const productMap = new Map(products.map((product) => [product.slug, product.producto_id]));
    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    for (const list of WISHLISTS) {
      const userId = userMap.get(list.email);
      if (!userId) continue;

      const { rows } = await pool.query(
        `INSERT INTO wishlists (usuario_id) VALUES ($1) RETURNING wishlist_id`,
        [userId],
      );
      const wishlistId = rows[0]?.wishlist_id;
      if (!wishlistId) continue;

      for (const slug of list.items) {
        const productId = productMap.get(slug);
        if (!productId) {
          console.warn(`Producto ${slug} no encontrado para wishlist de ${list.email}`);
          continue;
        }

        await pool.query(
          `
            INSERT INTO wishlist_items (wishlist_id, producto_id)
            VALUES ($1, $2)
          `,
          [wishlistId, productId],
        );
      }
      console.log(`Wishlist creada para ${list.email}`);
    }

    console.log("Seed de wishlists completado.");
  } catch (error) {
    console.error("Error al insertar wishlists:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedWishlists();
