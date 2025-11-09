export const normalizeCategory = (category = {}) => ({
  id: category.id ?? null,
  slug: category.slug ?? null,
  name: category.name ?? category.title ?? "",
  parentId: category.parentId ?? null,
  description: category.description ?? "",
  coverImage: category.coverImage ?? null,
});

export const normalizeCategoryList = (payload) => {
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  return list.map(normalizeCategory);
};
