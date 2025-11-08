import { env } from "../../../config/env.js";
import { API_PATHS } from "../../../config/api-paths.js";
import { mockCatalogApi } from "../../../mocks/api/products.js";
import { apiClient } from "../../../services/api-client.js";

const coerceNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return null;
};

const slugify = (value) => {
  if (!value) return null;
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          search.append(key, item);
        }
      });
      return;
    }
    search.append(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

const normalizeProduct = (product = {}) => {
  const resolvedId = pickFirst(
    product.id,
    product.productId,
    product.product_id,
    product.sku,
    product.slug,
  );

  const name =
    pickFirst(product.name, product.nombre, product.title, product.slug) ?? "Producto MOA";

  const slug =
    pickFirst(product.slug, resolvedId !== null ? String(resolvedId) : null, slugify(name)) ?? null;

  const price = coerceNumber(
    pickFirst(
      product.price,
      product.precio,
      product.priceCLP,
      product.precioCLP,
      product?.pricing?.price,
    ),
  );

  const compareAtPrice = coerceNumber(
    pickFirst(product.compareAtPrice, product.precio_original, product.precioNormal),
  );

  const imageUrl = pickFirst(product.imageUrl, product.imagen_url, product.image, product.coverImage);

  const gallery =
    Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : imageUrl
        ? [imageUrl]
        : [];

  const categoryId = pickFirst(
    product.categoryId,
    product.fk_categoria_id,
    product.categoria_id,
  );

  const categoryIds =
    Array.isArray(product.categoryIds) && product.categoryIds.length
      ? product.categoryIds
      : categoryId !== undefined && categoryId !== null
        ? [categoryId]
        : [];

  const collectionIds =
    Array.isArray(product.collectionIds) && product.collectionIds.length
      ? product.collectionIds
      : product.categoria_slug
        ? [product.categoria_slug]
        : [];

  return {
    ...product,
    id: resolvedId ?? null,
    slug,
    name,
    title: product.title ?? name,
    shortDescription: product.shortDescription ?? product.descripcion ?? "",
    description: product.description ?? product.descripcion ?? "",
    price: price ?? null,
    priceCLP: price ?? product.priceCLP ?? product.precioCLP ?? null,
    compareAtPrice: compareAtPrice ?? null,
    imageUrl: imageUrl ?? null,
    imagen_url: product.imagen_url ?? imageUrl ?? null,
    gallery,
    categoryId: categoryId ?? null,
    categoryIds,
    collectionIds,
    sku: product.sku ?? product.codigo ?? null,
    stock: coerceNumber(product.stock),
  };
};

const normalizeListResponse = (payload = {}) => {
  const itemsSource = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.products)
      ? payload.products
      : [];
  const items = itemsSource.map(normalizeProduct);
  const total = Number.isFinite(payload.total) ? payload.total : items.length;
  const page = payload.page && typeof payload.page === "object"
    ? {
        offset: Number.isFinite(Number(payload.page.offset)) ? Number(payload.page.offset) : 0,
        limit: Number.isFinite(Number(payload.page.limit)) ? Number(payload.page.limit) : items.length,
      }
    : {
        offset: 0,
        limit: items.length,
      };

  return { items, total, page };
};

const normalizeCategory = (category = {}) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  parentId: category.parentId ?? null,
  description: category.description ?? "",
  coverImage: category.coverImage ?? null,
});

const normalizeCategoryList = (payload) => {
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  return list.map(normalizeCategory);
};

const remoteProductsApi = {
  async list(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.catalog.products}${query}`);
    return normalizeListResponse(data);
  },

  async getById(id) {
    if (id === undefined || id === null) {
      throw new Error("product id is required");
    }
    const data = await apiClient.public.get(API_PATHS.catalog.productDetail(id));
    return normalizeProduct(data);
  },

  async listCategories(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.catalog.categories}${query}`);
    return normalizeCategoryList(data);
  },
};

const mockProductsApi = {
  async list(params = {}) {
    const data = await mockCatalogApi.list(params);
    return normalizeListResponse(data);
  },

  async getById(id) {
    if (id === undefined || id === null) {
      throw new Error("product id is required");
    }
    const data = await mockCatalogApi.getById(id);
    return normalizeProduct(data);
  },

  async listCategories(params = {}) {
    const data = await mockCatalogApi.listCategories(params);
    return normalizeCategoryList(data);
  },
};

export const productsApi = env.USE_MOCKS ? mockProductsApi : remoteProductsApi;
