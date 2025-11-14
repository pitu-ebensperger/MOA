import { PRODUCTS, CATEGORIES, COLLECTIONS } from "../database/index.js";
import { delay } from "../../utils/delay.js";
import { normalizeCategory } from "../../utils/normalizers.js";
import { buildProductCategoryPool } from "../../modules/products/utils/product.js";
import { ALL_CATEGORY_ID } from "../../utils/constants.js";

const cloneProduct = (product) => ({
  ...product,
  gallery: Array.isArray(product.gallery) ? [...product.gallery] : [],
  badge: Array.isArray(product.badge) ? [...product.badge] : [],
  tags: Array.isArray(product.tags) ? [...product.tags] : [],
  materials: Array.isArray(product.materials) ? [...product.materials] : [],
});

const cloneCollection = (collection) => ({
  ...collection,
  productIds: Array.isArray(collection.productIds)
    ? [...collection.productIds]
    : [],
});

const catalogDb = {
  categories: CATEGORIES.map(normalizeCategory),
  products: PRODUCTS.map(cloneProduct),
  collections: COLLECTIONS.map(cloneCollection),
};

const CATEGORY_SLUG_TO_ID = new Map(
  catalogDb.categories
    .filter((category) => typeof category.slug === "string")
    .map((category) => [category.slug.toLowerCase(), category.id])
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
  if (value === undefined || value === null || value === ALL_CATEGORY_ID)
    return null;
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
  if (productCollection === undefined || productCollection === null)
    return false;

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
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      );
    default:
      return products;
  }
};

const normalizeIncomingProduct = (payload = {}) => {
  if (payload.id === undefined || payload.id === null) {
    throw new Error("product id is required in mock mode");
  }
  const id = payload.id;
  const now = new Date().toISOString();
  const price = Number(payload.price ?? 0);
  const stock = Number(payload.stock ?? 0);

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
        ? payload.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

  const materials =
    Array.isArray(payload.materials) && payload.materials.length
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
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) ? stock : 0,
    description: payload.description ?? "",
    shortDescription: payload.shortDescription ?? "",
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
    variantOptions: Array.isArray(payload.variantOptions)
      ? payload.variantOptions
      : [],
    fk_category_id: payload.fk_category_id ?? null,
    fk_collection_id: payload.fk_collection_id ?? null,
    collection: payload.collection ?? null,
    collectionDescription: payload.collectionDescription ?? null,
    createdAt: now,
    updatedAt: now,
    compareAtPrice: payload.compareAtPrice ?? null,
  };
};

export const mockCatalogApi = {
  async list(params = {}) {
    const {
      q,
      categoryId,
      collectionId,
      minPrice,
      maxPrice,
      offset = 0,
      limit = null,
      sort: sortBy,
    } = params;

    await delay();

    const numericMin = toNumber(minPrice);
    const numericMax = toNumber(maxPrice);

    const filtered = catalogDb.products.filter(
      (product) =>
        matchesText(product, q) &&
        matchesCategory(product, categoryId) &&
        matchesCollection(product, collectionId) &&
        matchesPrice(product, numericMin, numericMax)
    );

    const sorted = sortProducts(filtered, sortBy);
    const safeOffset = Math.max(0, Number(offset) || 0);
    const safeLimit =
      Number.isFinite(Number(limit)) && Number(limit) > 0
        ? Number(limit)
        : null;
    const items =
      safeLimit === null
        ? sorted
        : sorted.slice(safeOffset, safeOffset + safeLimit);

    return {
      items,
      total: sorted.length,
      page: {
        offset: safeOffset,
        limit: safeLimit ?? sorted.length,
      },
    };
  },

  async getById(productId) {
    if (productId === undefined || productId === null) {
      throw new Error("productId is required");
    }
    await delay();
    const numericId = toNumber(productId);
    const product = catalogDb.products.find((item) => {
      if (numericId !== null && Number(item.id) === numericId) return true;
      if (String(item.id) === String(productId)) return true;
      if (typeof productId === "string" && typeof item.slug === "string") {
        return item.slug === productId;
      }
      return false;
    });
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    return product;
  },

  async getBySlug(slug) {
    if (!slug) throw new Error("slug is required");
    await delay();
    const product = catalogDb.products.find((item) => item.slug === slug);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    return product;
  },

  async listCategories({ parentId = null } = {}) {
    await delay();
    if (parentId === undefined || parentId === null) {
      return catalogDb.categories.map((category) => ({ ...category }));
    }
    const normalizedParent = toNumber(parentId);
    return catalogDb.categories
      .filter((category) => {
        if (normalizedParent !== null)
          return category.parentId === normalizedParent;
        return String(category.parentId ?? "") === String(parentId);
      })
      .map((category) => ({ ...category }));
  },

  async listCollections() {
    await delay();
    return catalogDb.collections.map((collection) => {
      const productIds = Array.isArray(collection.productIds)
        ? collection.productIds
        : [];
      return {
        ...collection,
        products: productIds
          .map((id) => catalogDb.products.find((product) => product.id === id))
          .filter(Boolean),
      };
    });
  },

  async create(payload = {}) {
    await delay();
    const product = normalizeIncomingProduct(payload);
    catalogDb.products.unshift(product);
    return product;
  },
};

export async function getProducts() {
  return catalogDb.products;
}
