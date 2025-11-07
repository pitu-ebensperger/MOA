import { env } from "../../../config/env.js";
import { API_PATHS } from "../../../config/api-paths.js";
import { mockCatalogApi } from "../../../mocks/api/catalog.js";
import { apiClient } from "../../../services/api-client.js";

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

const normalizeProduct = (product = {}) => ({ ...product });

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
