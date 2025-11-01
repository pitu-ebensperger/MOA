import { apiClient } from "../../../shared/services/api-client.js";
import { API_PATHS } from "../../../config/api-paths.js";

const mapProduct = (data) => ({
  id: data.id,
  name: data.name,
  price: data.price,
  imageUrl: data.imageUrl,
  ...data,
});

const list = async (params = {}) => {
  const data = await apiClient.public.get(API_PATHS.catalog.products, {
    params,
  });
  const candidates = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];
  return {
    items: candidates.map(mapProduct),
    total: data?.total ?? candidates.length,
  };
};

const getById = async (productId) => {
  if (!productId) throw new Error("productId is required");
  const payload = await apiClient.public.get(API_PATHS.catalog.productDetail(productId));
  return mapProduct(payload);
};

const listCategories = async () => {
  const data = await apiClient.public.get(API_PATHS.catalog.categories);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const productsApi = {
  list,
  getById,
  listCategories,
};
