import { catalogDb } from "../database/index.js";
import { delay } from "../utils/delay.js";

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

const matchesCategory = (product, categoryId) => {
  if (!categoryId || categoryId === "all") return true;
  const numericId = toNumber(categoryId);
  if (!product?.categoryIds) return false;
  if (numericId !== null) return product.categoryIds.includes(numericId);
  return product.categoryIds.some((id) => String(id) === String(categoryId));
};

const matchesCollection = (product, collectionId) => {
  if (!collectionId) return true;
  if (!Array.isArray(product.collectionIds)) return false;
  return product.collectionIds.some((id) => id === collectionId);
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

const normalizeCategory = (category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  parentId: category.parentId ?? null,
  description: category.description ?? "",
  coverImage: category.coverImage ?? null,
});

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
    const product = catalogDb.products.find((item) => {
      if (numericId !== null) return item.id === numericId;
      return String(item.id) === String(productId);
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
      return catalogDb.categories.map(normalizeCategory);
    }
    const normalizedParent = toNumber(parentId);
    return catalogDb.categories
      .filter((category) => {
        if (normalizedParent !== null) return category.parentId === normalizedParent;
        return String(category.parentId ?? "") === String(parentId);
      })
      .map(normalizeCategory);
  },

  async listCollections() {
    await delay();
    return catalogDb.collections.map((collection) => ({
      ...collection,
      products: collection.productIds
        .map((id) => catalogDb.products.find((product) => product.id === id))
        .filter(Boolean),
    }));
  },
};
