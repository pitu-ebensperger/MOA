// Placeholders
export const DEFAULT_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop";

// Categorias
export const ALL_CATEGORY_ID = "all";

// Páginas
export const DEFAULT_PAGE_SIZE = 9;
export const PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 12, 18, 24];

// Productos
export const PRODUCT_STATUS = ["activo", "sin_stock", "borrador"];

export const PRODUCT_STATUS_LABELS = {
  activo: "Activo",
  sin_stock: "Sin stock",
  borrador: "Borrador",
};
export const PRODUCT_STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  ...PRODUCT_STATUS.map((value) => ({
    value,
    label: PRODUCT_STATUS_LABELS[value] ?? value,
  })),
];