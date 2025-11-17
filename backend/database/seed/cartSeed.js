import pool from "../config.js";
import { CARTS, CART_ITEMS } from "./cartData.js";

async function seedCarts() {
  try {
    for (const cart of CARTS) {
      const userRes = await pool.query(
        "SELECT usuario_id FROM usuarios WHERE public_id = $1",
        [cart.userId]
      );

      if (!userRes.rowCount) {
        console.warn(`Usuario '${cart.userId}' no encontrado para el carrito '${cart.id}'`);
        continue;
      }

      const usuarioId = userRes.rows[0].usuario_id;
      const carritoRes = await pool.query(
        `
        INSERT INTO carritos (usuario_id, status, updated_at)
          VALUES ($1, 'ABIERTO', COALESCE($2, now()))
        ON CONFLICT (usuario_id) DO UPDATE SET
          status = 'ABIERTO',
          updated_at = COALESCE($2, now())
        RETURNING carrito_id
      `,
        [usuarioId, cart.updatedAt]
      );

      const carritoId = carritoRes.rows[0].carrito_id;
      const cartItems = CART_ITEMS.filter((item) => item.cartId === cart.id);

      for (const item of cartItems) {
        const productRes = await pool.query(
          "SELECT producto_id, precio_cents FROM productos WHERE slug = $1",
          [item.productSlug]
        );

        if (!productRes.rowCount) {
          console.warn(`Producto '${item.productSlug}' no encontrado para carritos`);
          continue;
        }

        const productoId = productRes.rows[0].producto_id;
        const precioUnit = productRes.rows[0].precio_cents;

        await pool.query(
          `
          INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unit)
            VALUES ($1, $2, $3, $4)
          ON CONFLICT (carrito_id, producto_id) DO UPDATE SET
            cantidad = EXCLUDED.cantidad,
            precio_unit = EXCLUDED.precio_unit
        `,
          [carritoId, productoId, item.cantidad, precioUnit]
        );
      }
    }

    console.log("Carritos y sus items sincronizados");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar carritos:", error);
    process.exit(1);
  }
}

seedCarts();
