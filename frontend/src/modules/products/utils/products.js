import { toNum } from "@/utils/number.js";

export const resolveProductPrice = (product) => {
  return toNum(product?.price);
};

export { buildProductCategoryPool } from "./productCategory.js";

export {
  matchesText,
  createCategoryMatcher,
  matchesPrice,
  matchesStatus,
} from "./productsFilter.js";
