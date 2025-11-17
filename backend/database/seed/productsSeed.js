import pool from "../config.js";
import { nanoid } from "nanoid";
import { PRODUCTS as productsData } from "./productsData.js";

function normalizeProduct(product) {
  return {
    public_id: nanoid(),

    categoria_id: product.fk_category_id ?? null,
    collection_id: product.fk_collection_id ?? null,

    nombre: product.name,
    slug: product.slug,
    sku: product.sku,

    precio_cents: product.price * 100,
    compare_at_price_cents: product.compareAtPrice
      ? product.compareAtPrice * 100
      : null,

    stock: product.stock ?? 0,
    status: product.status ?? "activo",

    descripcion: product.description ?? null,
    descripcion_corta: product.shortDescription ?? null,

    img_url: product.imgUrl ?? null,
    gallery: product.gallery ?? null,

    badge: product.badge ?? [],
    tags: product.tags ?? [],

    color: product.color ?? null,
    material: product.material ?? null,

    dimensions: product.dimensions ? JSON.stringify(product.dimensions) : null,
    weight: product.weight ? JSON.stringify(product.weight) : null,
    specs: product.specs ? JSON.stringify(product.specs) : null,
  };
}

async function seedProducts() {
  try {
    for (const product of productsData) {
      const p = normalizeProduct(product);

      const query = `
        INSERT INTO productos (
          public_id,
          categoria_id,
          collection_id,
          nombre,
          slug,
          sku,
          precio_cents,
          compare_at_price_cents,
          stock,
          status,
          descripcion,
          descripcion_corta,
          img_url,
          gallery,
          badge,
          tags,
          color,
          material,
          dimensions,
          weight,
          specs
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18,
          $19, $20, $21
        )
        RETURNING producto_id;
      `;

      const values = [
        p.public_id,
        p.categoria_id,
        p.collection_id,
        p.nombre,
        p.slug,
        p.sku,
        p.precio_cents,
        p.compare_at_price_cents,
        p.stock,
        p.status,
        p.descripcion,
        p.descripcion_corta,
        p.img_url,
        p.gallery,
        p.badge,
        p.tags,
        p.color,
        p.material,
        p.dimensions,
        p.weight,
        p.specs,
      ];

      const result = await pool.query(query, values);
      console.log(`Producto insertado → ID: ${result.rows[0].producto_id}`);
    }

    console.log("Seed de productos COMPLETADO con éxito.");
  } catch (error) {
    console.error("Error al insertar productos:", error);
  } finally {
    pool.end();
  }
}

seedProducts();
