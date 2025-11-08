import { productsDb, PRODUCTS, CATEGORIES } from "../database/index.js";
import { delay } from "../utils/delay.js";
import { buildProductCategoryPool } from "../../modules/products/utils/product.js";
import { ALL_CATEGORY_ID } from "../../modules/products/constants.js";

const normalizeCategory = (category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  parentId: category.parentId ?? null,
  description: category.description ?? "",
  coverImage: category.coverImage ?? null,
});

const catalogDb = {
  categories: CATEGORIES.map(normalizeCategory),
  products: PRODUCTS,
  collections: Array.isArray(productsDb?.collections) ? productsDb.collections : [],
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

const normalizeSlug = (value) => {
  if (typeof value !== "string") return null;
  return value.trim().toLowerCase();
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
  const pool = [];
  if (product?.fk_collection_id !== undefined && product?.fk_collection_id !== null) {
    pool.push(product.fk_collection_id);
  }
  if (product?.collectionId !== undefined && product?.collectionId !== null) {
    pool.push(product.collectionId);
  }
  if (Array.isArray(product?.collectionIds)) {
    pool.push(...product.collectionIds);
  }
  if (!pool.length) return false;

  const targetNumber = toNumber(collectionId);
  if (targetNumber !== null) {
    return pool.some((id) => Number(id) === targetNumber);
  }
  const normalized = String(collectionId).toLowerCase();
  return pool.some((id) => String(id).toLowerCase() === normalized);
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
        matchesPrice(product, numericMin, numericMax),
    );

    const sorted = sortProducts(filtered, sortBy);
    const safeOffset = Math.max(0, Number(offset) || 0);
    const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : null;
    const items = safeLimit === null ? sorted : sorted.slice(safeOffset, safeOffset + safeLimit);

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
    const targetSlug = normalizeSlug(productId);
    const product = catalogDb.products.find((item) => {
      if (numericId !== null && Number(item.id) === numericId) return true;
      if (String(item.id) === String(productId)) return true;
      if (targetSlug && item.slug) {
        return normalizeSlug(item.slug) === targetSlug;
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
        ...collection,
        products: productIds
          .map((id) => catalogDb.products.find((product) => product.id === id))
          .filter(Boolean),
      };
    });
  },
};

export async function getProducts() {
  return PRODUCTS;
}
