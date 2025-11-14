import { toNum } from "./number.js";

export const normalizeProduct = (p = {}) => {
  const id = p.id ?? null;
  const name = p.name ?? ""; 
  const slug = p.slug != null ? String(p.slug) : null;
  const sku = p.sku ?? null;

  const price = toNum(p.price);
  const compareAtPrice = toNum(p.compareAtPrice);

  const imgUrl = p.imgUrl ?? null;
  const gallery = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : (imgUrl ? [imgUrl] : []);

  const stock = toNum(p.stock);
  const stockSafe = stock ?? 0;

  const badge = Array.isArray(p.badge) ? p.badge : (p.badge ? [p.badge] : []);
  const tags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === "string"
    ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const material = p.material ?? (Array.isArray(p.materials) ? p.materials[0] : null);
  const materials = Array.isArray(p.materials) ? p.materials : (material ? [material] : []);

  const status = p.status ?? (stockSafe > 0 ? "activo" : "sin_stock");

  return {
    id,
    name,
    slug,
    sku,
    price,
    compareAtPrice,
    stock: stockSafe,
    description: p.description ?? "",
    imgUrl,
    gallery,
    badge,
    status,
    tags,
    material,
    materials,
    color: p.color ?? null,
    dimensions: p.dimensions ?? null,
    weight: p.weight ?? null,
    specs: p.specs ?? null,
    createdAt: p.createdAt ?? null,
    updatedAt: p.updatedAt ?? null,
    fk_category_id: p.fk_category_id ?? null,
    fk_collection_id: p.fk_collection_id ?? null,
    collection: p.collection ?? null,
  };
};

export const normalizeCategory = (category = {}) => ({
  id: category.id ?? null,
  slug: category.slug ?? null,
  name: category.name ?? category.title ?? "",
  parentId: category.parentId ?? null,
  description: category.description ?? "",
  coverImage: category.coverImage ?? null,
});

export const normalizeCategoryList = (payload) => {
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  return list.map(normalizeCategory);
};
