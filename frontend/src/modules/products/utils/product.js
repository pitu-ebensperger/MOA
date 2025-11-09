import { ALL_CATEGORY_ID } from "../../../utils/constants.js";

const CATEGORY_VALUE_KEYS = ["fk_category_id"];

const normalizeCategoryToken = (value) => {
  if (value === undefined || value === null) {
    return { numeric: null, text: null };
  }

  if (typeof value === "number") {
    return {
      numeric: Number.isFinite(value) ? value : null,
      text: String(value).toLowerCase(),
    };
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return { numeric: null, text: null };
  }

  const numeric = Number(stringValue);
  return {
    numeric: Number.isFinite(numeric) ? numeric : null,
    text: stringValue.toLowerCase(),
  };
};

export const buildProductCategoryPool = (product) => {
  const pool = [];

  CATEGORY_VALUE_KEYS.forEach((key) => {
    const candidate = product?.[key];
    if (candidate !== undefined && candidate !== null) {
      pool.push(candidate);
    }
  });

  return pool;
};

export const matchesProductCategory = (product, categoryValue) => {
  if (!categoryValue || categoryValue === ALL_CATEGORY_ID) return true;

  const target = normalizeCategoryToken(categoryValue);
  if (!target.text && target.numeric === null) return false;

  const pool = buildProductCategoryPool(product);
  if (!pool.length) return false;

  return pool.some((entry) => {
    const normalized = normalizeCategoryToken(entry);
    if (target.numeric !== null && normalized.numeric !== null) {
      return normalized.numeric === target.numeric;
    }
    if (target.text && normalized.text) {
      return normalized.text === target.text;
    }
    return false;
  });
};

export const resolveProductPrice = (product) => {
  const rawPrice = product?.price;
  if (rawPrice === undefined || rawPrice === null) return null;
  const numericValue = Number(rawPrice);
  return Number.isFinite(numericValue) ? numericValue : null;
};
