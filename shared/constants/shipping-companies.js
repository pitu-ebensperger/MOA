export const SHIPPING_COMPANIES = Object.freeze([
  { id: "chilexpress", label: "Chilexpress" },
  { id: "blue-express", label: "Blue Express" },
  { id: "starken", label: "Starken" },
  { id: "correos-de-chile", label: "Correos de Chile" },
  { id: "retiro-en-tienda", label: "Retiro en tienda" },
]);

export const SHIPPING_COMPANY_LABELS = SHIPPING_COMPANIES.map(({ label }) => label);

const SHIPPING_COMPANY_LOOKUP = new Map(
  SHIPPING_COMPANIES.flatMap(({ id, label }) => {
    const normalizedLabel = label.toLowerCase();
    return [
      [id, label],
      [normalizedLabel, label],
    ];
  }),
);

export const normalizeShippingCompany = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalizedKey = trimmed.toLowerCase();
  if (SHIPPING_COMPANY_LOOKUP.has(normalizedKey)) {
    return SHIPPING_COMPANY_LOOKUP.get(normalizedKey);
  }

  // Permitir que ya venga con el ID/slug almacenado en base de datos
  if (SHIPPING_COMPANY_LOOKUP.has(trimmed)) {
    return SHIPPING_COMPANY_LOOKUP.get(trimmed);
  }

  return null;
};

export const isValidShippingCompany = (value) => Boolean(normalizeShippingCompany(value));
