import { PRODUCTS, CATEGORIES, COLLECTIONS } from "../database/index.js";
import { delay } from "../../utils/delay.js";
import { normalizeCategory } from "../../utils/normalizers.js";
import { sortProducts } from "../../utils/sort.js";
import { matchesText, createCategoryMatcher, matchesCollection, matchesPrice, matchesStatus } from "../../modules/products/utils/productsFilter.js";
import { toNum } from "../../utils/number.js";

const cloneProduct = (p) => ({
  ...p,
  gallery: Array.isArray(p.gallery) ? [...p.gallery] : [],
  badge: Array.isArray(p.badge) ? [...p.badge] : [],
  tags: Array.isArray(p.tags) ? [...p.tags] : [],
  materials: Array.isArray(p.materials) ? [...p.materials] : [],
});

const cloneCollection = (collection) => ({
  ...collection,
  productIds: Array.isArray(collection.productIds) ? [...collection.productIds] : [],
});

const db = {
  categories: CATEGORIES.map(normalizeCategory),
  products: PRODUCTS.map(cloneProduct),
  collections: COLLECTIONS.map(cloneCollection),
};

const CATEGORY_SLUG_TO_ID = new Map(
  catalogDb.categories
    .filter((category) => typeof category.slug === "string")
    .map((category) => [category.slug.toLowerCase(), category.id]),
);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const matchesText = (product, text) => {
  if (!text) return true;
  const haystack = [
    product.name,
    product.shortDescription,
    product.description,
    product.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(text.toLowerCase());
};

const resolveCategoryTarget = (value) => {
  if (value === undefined || value === null || value === ALL_CATEGORY_ID) return null;
  const numeric = toNumber(value);
  if (numeric !== null) return numeric;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.toLowerCase();
    if (CATEGORY_SLUG_TO_ID.has(normalized)) {
      return CATEGORY_SLUG_TO_ID.get(normalized);
    }
  }
  return null;
};

const matchesCategory = (product, categoryValue) => {
  if (!categoryValue || categoryValue === ALL_CATEGORY_ID) return true;
  const pool = buildProductCategoryPool(product);
  if (!pool.length) return false;

  const targetId = resolveCategoryTarget(categoryValue);
  if (targetId !== null) {
    return pool.some((id) => Number(id) === targetId);
  }

  const normalized = String(categoryValue).toLowerCase();
  return pool.some((id) => String(id).toLowerCase() === normalized);
};

const matchesCollection = (product, collectionId) => {
  if (!collectionId) return true;
  const productCollection = product?.fk_collection_id;
  if (productCollection === undefined || productCollection === null) return false;

  const targetNumber = toNumber(collectionId);
  if (targetNumber !== null) {
    return Number(productCollection) === targetNumber;
  }
  const normalized = String(collectionId).toLowerCase();
  return String(productCollection).toLowerCase() === normalized;
};

const matchesPrice = (product, minPrice, maxPrice) => {
  const price = Number(product.price ?? 0);
  if (Number.isFinite(minPrice) && price < minPrice) return false;
  if (Number.isFinite(maxPrice) && price > maxPrice) return false;
  return true;
};

const sortProducts = (products, sortBy) => {
  if (!sortBy) return products;
  const copy = [...products];
  switch (sortBy) {
    case "price-asc":
      return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price-desc":
      return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "name-asc":
      return copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
    default:
      return products;
  }
};

const normalizeIncomingProduct = (payload = {}) => {
  if (payload.id === undefined || payload.id === null) {
    throw new Error("se necesita productId");
  }
  const id = payload.id;

  const gallery =
    Array.isArray(payload.gallery) && payload.gallery.length
      ? payload.gallery
      : payload.imgUrl
      ? [payload.imgUrl]
      : [];

  const tags =
    Array.isArray(payload.tags) && payload.tags.length
      ? payload.tags
      : typeof payload.tags === "string"
        ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

  const materials = Array.isArray(payload.materials)
    ? payload.materials
    : payload.material
    ? [payload.material]
    : [];

  const slugSource = payload.slug ?? payload.name ?? `producto-${id}`;

  return {
    id,
    name: payload.name ?? `Producto ${id}`,
    slug: slugSource ? String(slugSource) : null,
    sku: payload.sku ?? `MOA-${id}`,
    price: Number.isFinite(Number(payload.price)) ? Number(payload.price) : 0,
    stock: Number.isFinite(Number(payload.stock)) ? Number(payload.stock) : 0,
    description: payload.description ?? "",
    imgUrl: payload.imgUrl ?? gallery[0] ?? null,
    gallery,
    badge: Array.isArray(payload.badge)
      ? payload.badge
      : payload.badge
        ? [payload.badge]
        : [],
    status: payload.status ?? "activo",
    tags,
    material: payload.material ?? materials[0] ?? null,
    materials,
    color: payload.color ?? null,
    dimensions: payload.dimensions ?? null,
    weight: payload.weight ?? null,
    specs: payload.specs ?? null,
    variantOptions: Array.isArray(payload.variantOptions) ? payload.variantOptions : [],
    fk_category_id: payload.fk_category_id ?? null,
    fk_collection_id: payload.fk_collection_id ?? null,
    collection: payload.collection ?? null,
    createdAt: payload.createdAt ?? null,
    updatedAt: payload.updatedAt ?? null,
    compareAtPrice: Number.isFinite(Number(payload.compareAtPrice)) ? Number(payload.compareAtPrice) : null,
  };
};

/* API ------------------------------------------------------------------------------------------------------------------------ */
export const mockCatalogApi = {
  async list(params = {}) {
    const {
      q,
      status,
      categoryId,
      collectionId,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 20,
      sortBy = "updatedAt",
      sortDir = "desc",
    } = params;

    await delay();

    const numericMin = toNum(minPrice);
    const numericMax = toNum(maxPrice);

    const filtered = catalogDb.products.filter(
      (product) =>
        matchesText(product, q) &&
        matchesCategory(product, categoryId) &&
        matchesCollection(product, collectionId) &&
        matchesPrice(product, numericMin, numericMax),
    );

    const sorted = sortProducts(filtered, sortBy);
    const safeOffset = Math.max(0, Number(offset) || 0);
    const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : null;
    const items = safeLimit === null ? sorted : sorted.slice(safeOffset, safeOffset + safeLimit);

    return {
      items,
      total: sorted.length,
      page: { offset: off, limit: lim }, 
    };
  },

  async getById(productId) {
    if (productId === undefined || productId === null) {
      throw new Error("se necesita productId");
    }
    await delay();
    const numericId = toNum(productId);
    const product = db.products.find((item) => {
      if (numericId !== null && Number(item.id) === numericId) return true;
      if (s(item.id) === s(productId)) return true;
      if (typeof productId === "string" && typeof item.slug === "string") {
        return item.slug === productId;
      }
      return false;
    });
    if (!product) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return product;
  },

  async getBySlug(slug) {
    if (!slug) throw new Error("se necesita slug");
    await delay();
    const product = db.products.find((item) => item.slug === slug);
    if (!product) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return product;
  },

  async listCategories({ parentId = null } = {}) {
    await delay();
    if (parentId === undefined || parentId === null) {
      return db.categories.map((c) => ({ ...c }));
    }
    const normalizedParent = toNumber(parentId);
    return catalogDb.categories
      .filter((category) => {
        if (normalizedParent !== null) return category.parentId === normalizedParent;
        return String(category.parentId ?? "") === String(parentId);
      })
      .map((category) => ({ ...category }));
  },

  async listCollections() {
    await delay();
    return catalogDb.collections.map((collection) => {
      const productIds = Array.isArray(collection.productIds) ? collection.productIds : [];
      return {
        ...col,
        products: ids.map((id) => db.products.find((p) => p.id === id)).filter(Boolean),
      };
    });
  },

  async create(payload = {}) {
    await delay();
    const product = normalizeIncomingProduct(payload);
    const exists = db.products.some((p) => String(p.id) === String(product.id));
    if (exists) {
      const err = new Error("Esa productId ya existe");
      err.status = 409;
      throw err;
    }
    db.products.unshift(product);
    return product;
  },

  async update(id, patch = {}) {
    if (id === undefined || id === null) throw new Error("se necesita product id");
    await delay();
    const idx = db.products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    const current = db.products[idx];
    const next = cloneProduct({
      ...current,
      ...patch,
      badge: Array.isArray(patch.badge) ? patch.badge : patch.badge ? [patch.badge] : current.badge,
      tags:
        Array.isArray(patch.tags)
          ? patch.tags
          : typeof patch.tags === "string"
          ? patch.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : current.tags,
      materials:
        Array.isArray(patch.materials)
          ? patch.materials
          : patch.material
          ? [patch.material]
          : current.materials,
    });
    if ((!next.gallery || next.gallery.length === 0) && next.imgUrl) {
      next.gallery = [next.imgUrl];
    }
    db.products[idx] = next;
    return next;
  },

  async remove(id) {
    if (id === undefined || id === null) throw new Error("se necesita product idd");
    await delay();
    const idx = db.products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    const [removed] = db.products.splice(idx, 1);
    return { ok: true, removedId: removed.id };
  },
};

export async function getProducts() {
  return db.products;
}
