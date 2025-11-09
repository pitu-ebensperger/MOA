import { PRODUCTS, CATEGORIES, contentDb } from "../database/index.js";
import { delay } from "../../utils/delay.js";
import { normalizeCategory } from "../../utils/normalizers.js";

const catalogDb = {
  categories: CATEGORIES.map(normalizeCategory),
  products: PRODUCTS,
};

const pickCategories = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return catalogDb.categories
      .filter((category) => category.parentId === null)
      .slice(0, 6)
      .map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        coverImage: category.coverImage,
      }));
  }

  const mapped = ids
    .map((categoryId) => {
      const item = catalogDb.categories.find((category) => category.id === categoryId);
      if (!item) return null;
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        coverImage: item.coverImage,
      };
    })
    .filter(Boolean);

  if (mapped.length) return mapped;
  return pickCategories([]);
};

const pickProducts = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return catalogDb.products.slice(0, 4);
  }
  const mapped = ids
    .map((productId) => catalogDb.products.find((product) => product.id === productId))
    .filter(Boolean);
  return mapped.length ? mapped : catalogDb.products.slice(0, 4);
};

export const mockHomeApi = {
  async getLanding() {
    await delay();
    const home = contentDb.home;

    return {
      categories: pickCategories(home.featuredCategoryIds),
      featuredProducts: pickProducts(home.featuredProductIds),
      editorialSections: home.editorialSections ?? [],
      testimonials: home.testimonials ?? [],
      contact: home.contact ?? null,
    };
  },
};
