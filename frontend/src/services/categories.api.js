import { env } from "@/config/env.js";
import { API_PATHS } from "@/config/api-paths.js";
import { apiClient } from "@/services/api-client.js";
import { normalizeCategory, normalizeCategoryList } from "@/utils/normalizers.js";

import { delay } from "@/utils/delay.js";
import { PRODUCTS } from "@/mocks/database/products.js";
import { CATEGORIES } from "@/mocks/database/categories.js";

const slugPattern = /^[a-z0-9-]+$/;

const sanitizeSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

const remoteCategoriesApi = {
  async list() {
    const data = await apiClient.get(API_PATHS.products.categories);
    return normalizeCategoryList(data);
  },
  async create(payload = {}) {
    const response = await apiClient.post(API_PATHS.admin.categories, payload);
    const payloadData = response?.data ?? response;
    return normalizeCategory(payloadData);
  },
  async update(id, patch = {}) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    const response = await apiClient.put(API_PATHS.admin.categoryDetail(id), patch);
    const payloadData = response?.data ?? response;
    return normalizeCategory(payloadData);
  },
  async remove(id) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    return apiClient.delete(API_PATHS.admin.categoryDetail(id));
  },
  async countProducts(id) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    const response = await apiClient.get(API_PATHS.admin.categoryProductsCount(id));
    return response?.data?.producto_count ?? response?.data?.productCount ?? null;
  },
};

let mockCategories = CATEGORIES.map((category) => normalizeCategory(category));
let nextMockCategoryId =
  mockCategories.reduce((max, category) => Math.max(max, Number(category.id) || 0), 0) + 1;

const ensureUniqueSlug = (slug, excludeId = null) =>
  mockCategories.some(
    (category) =>
      String(category.slug) === String(slug) &&
      (excludeId === null || String(category.id) !== String(excludeId)),
  );

const findMockCategoryIndex = (id) =>
  mockCategories.findIndex((category) => String(category.id) === String(id));

const mockCategoriesApi = {
  async list() {
    await delay();
    return normalizeCategoryList(mockCategories);
  },
  async create(payload = {}) {
    await delay();
    const name = payload.nombre?.trim();
    const rawSlug = payload.slug?.trim() || name;
    const slug = sanitizeSlug(rawSlug);
    const description = payload.descripcion?.trim() ?? "";
    const coverImage = payload.cover_image?.trim() ?? payload.coverImage?.trim() ?? null;

    if (!name || !slug) {
      const error = new Error("Nombre y slug son obligatorios");
      error.status = 400;
      throw error;
    }
    if (!slugPattern.test(slug)) {
      const error = new Error("El slug solo puede contener letras minúsculas, números y guiones");
      error.status = 400;
      throw error;
    }
    if (ensureUniqueSlug(slug)) {
      const error = new Error("El slug ya existe");
      error.status = 400;
      throw error;
    }

    const nextCategory = normalizeCategory({
      id: nextMockCategoryId++,
      name,
      slug,
      description,
      coverImage,
      parentId: null,
    });

    mockCategories.push(nextCategory);
    return nextCategory;
  },
  async update(id, patch = {}) {
    await delay();
    const index = findMockCategoryIndex(id);
    if (index === -1) {
      const error = new Error("Categoría no encontrada");
      error.status = 404;
      throw error;
    }
    const current = mockCategories[index];
    const name = patch.nombre?.trim() ?? current.name;
    const rawSlug = patch.slug?.trim() ?? current.slug;
    const slug = sanitizeSlug(rawSlug);
    const description =
      patch.descripcion === undefined ? current.description : patch.descripcion?.trim() ?? "";
    const coverImage =
      patch.cover_image === undefined
        ? current.coverImage
        : patch.cover_image?.trim() ?? null;

    if (!name || !slug) {
      const error = new Error("Nombre y slug son obligatorios");
      error.status = 400;
      throw error;
    }
    if (!slugPattern.test(slug)) {
      const error = new Error("El slug solo puede contener letras minúsculas, números y guiones");
      error.status = 400;
      throw error;
    }
    if (slug !== current.slug && ensureUniqueSlug(slug, id)) {
      const error = new Error("El slug ya existe");
      error.status = 400;
      throw error;
    }

    const updatedCategory = normalizeCategory({
      ...current,
      name,
      slug,
      description,
      coverImage,
    });

    mockCategories[index] = updatedCategory;
    return updatedCategory;
  },
  async remove(id) {
    await delay();
    const index = findMockCategoryIndex(id);
    if (index === -1) {
      const error = new Error("Categoría no encontrada");
      error.status = 404;
      throw error;
    }
    const numericId = Number(id);
    const linkedProducts = PRODUCTS.filter(
      (product) => Number(product.fk_category_id) === numericId,
    ).length;

    if (linkedProducts > 0) {
      const error = new Error(
        `No se puede eliminar la categoría porque tiene ${linkedProducts} producto(s) asociado(s)`,
      );
      error.status = 400;
      throw error;
    }

    mockCategories.splice(index, 1);
    return { success: true, message: "Categoría eliminada exitosamente" };
  },
  async countProducts(id) {
    await delay();
    const numericId = Number(id);
    return PRODUCTS.filter((product) => Number(product.fk_category_id) === numericId).length;
  },
};

export const categoriesApi = env.USE_MOCKS ? mockCategoriesApi : remoteCategoriesApi;
