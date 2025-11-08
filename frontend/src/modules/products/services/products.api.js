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

  const name = pickFirst(product.name, product.nombre, product.title, product.slug) ?? "Producto MOA";

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
    pickFirst(
      product.compareAtPrice,
      product.precio_original,
      product.precioNormal,
      product.priceBefore,
    ),
  );

  const imgUrl = pickFirst(
    product.imgUrl,
    product.imageUrl,
    product.imagen_url,
    product.image,
    product.coverImage,
  );

  const gallery =
    Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : imgUrl
        ? [imgUrl]
        : [];

  const fkCategoryId = pickFirst(
    product.fk_category_id,
    product.categoryId,
    product.category_id,
    product.fk_categoria_id,
  );

  const fkCollectionId = pickFirst(
    product.fk_collection_id,
    product.collectionId,
    product.collection_id,
  );

  const stock = coerceNumber(product.stock);

  const badgeList = Array.isArray(product.badge)
    ? product.badge
    : product.badge
      ? [product.badge]
      : [];

  const tags =
    Array.isArray(product.tags) && product.tags.length
      ? product.tags
      : typeof product.tags === "string"
        ? product.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

  const material = product.material ?? (Array.isArray(product.materials) ? product.materials[0] : null);
  const materials = Array.isArray(product.materials)
    ? product.materials
    : material
      ? [material]
      : [];

  const createdAt = product.createdAt ?? product.updatedAt ?? new Date().toISOString();
  const updatedAt = product.updatedAt ?? createdAt;

  return {
    id: resolvedId ?? null,
    name,
    slug,
    sku: pickFirst(product.sku, product.codigo, product.productSku, slug) ?? slug ?? null,
    price: price ?? null,
    stock: stock ?? 0,
    description: product.description ?? product.descripcion ?? "",
    shortDescription: product.shortDescription ?? product.descripcion ?? "",
    imgUrl: imgUrl ?? null,
    gallery,
    badge: badgeList,
    status: product.status ?? ((stock ?? 0) > 0 ? "activo" : "sin_stock"),
    tags,
    material,
    materials,
    color: product.color ?? product.finish ?? null,
    dimensions: product.dimensions ?? null,
    weight: product.weight ?? null,
    specs: product.specs ?? null,
    variantOptions: product.variantOptions ?? [],
    createdAt,
    updatedAt,
    fk_category_id: fkCategoryId ?? null,
    fk_collection_id: fkCollectionId ?? null,
    collection: pickFirst(product.collection, product.collectionName, product.collectionLabel) ?? null,
    compareAtPrice: compareAtPrice ?? null,
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
