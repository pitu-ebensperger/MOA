export const PRODUCTS = [
  {
    id: 101,
    name: "Silla comedor roble curvo",
    price: 129_990,
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop",
    ],
    variants: [
      { id: "roble", name: "Roble", colorHex: "#b08968" },
      { id: "nogal", name: "Nogal", colorHex: "#6b4f3a" },
      { id: "negro", name: "Negro", colorHex: "#222222" },
    ],
    categoryIds: [6, 2], 
    stock: 12,
  },
  {
    id: 102,
    name: "Lámpara cúpula lino natural",
    price: 59_990,
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop",
    ],
    variants: [{ id: "lino", name: "Lino", colorHex: "#d9cab3" }],
    categoryIds: [8],
    stock: 8,
  },
  {
    id: 103,
    name: "Mesa lateral minimal",
    price: 89_990,
    images: [
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop",
    ],
    variants: [
      { id: "arena", name: "Arena", colorHex: "#d2b48c" },
      { id: "gris", name: "Gris", colorHex: "#9ca3af" },
    ],
    categoryIds: [11],
    stock: 5,
  },
];


export const ORDERS = [
  {
    id: 1,
    date: "2025-10-25",
    status: "Entregado",
    total: 150_000,
    customer: "Rodrigo Pérez",
    items: [
      { productId: 101, name: "Silla comedor roble curvo", qty: 1, priceUnit: 129_990 },
      { productId: 103, name: "Mesa lateral minimal",     qty: 1, priceUnit: 89_990 },
    ],
  },
  {
    id: 2,
    date: "2025-10-20",
    status: "En camino",
    total: 75_000,
    customer: "David García",
    items: [{ productId: 201, name: "Butaca nórdica lino", qty: 1, priceUnit: 75_000 }],
  },
  {
    id: 3,
    date: "2025-10-15",
    status: "Procesando",
    total: 200_000,
    customer: "Camila López",
    items: [
      { productId: 102, name: "Lámpara cúpula lino natural", qty: 2, priceUnit: 59_990 },
      { productId: 205, name: "Rack TV minimal",             qty: 1, priceUnit: 80_020 },
    ],
  },
];


// ---------- Categorías ----------
export const CATEGORIES = [
  // Raíz (parentId = null)
  { id: 1,  slug: "dormitorio",   name: "Dormitorio",   parentId: null },
  { id: 2,  slug: "living",       name: "Living",       parentId: null },
  { id: 3,  slug: "comedor",      name: "Comedor",      parentId: null },
  { id: 4,  slug: "exterior",     name: "Exterior",     parentId: null },
  { id: 5,  slug: "oficina",      name: "Oficina",      parentId: null },
  { id: 6,  slug: "iluminacion",  name: "Iluminación",  parentId: null },
  { id: 7,  slug: "decoracion",   name: "Decoración",   parentId: null },
  { id: 8,  slug: "almacenamiento", name: "Almacenamiento", parentId: null },
  { id: 9,  slug: "textiles",     name: "Textiles",     parentId: null },

  // Subcategorías de Dormitorio (parentId: 1)
  { id: 101, slug: "camas",        name: "Camas",        parentId: 1 },
  { id: 102, slug: "veladores",    name: "Veladores",    parentId: 1 },
  { id: 103, slug: "comodas",      name: "Cómodas",      parentId: 1 },
  { id: 104, slug: "respaldos",    name: "Respaldos",    parentId: 1 },
  { id: 105, slug: "roperos",      name: "Roperos",      parentId: 1 },

  // Subcategorías de Living (parentId: 2)
  { id: 201, slug: "sofas",          name: "Sofás",             parentId: 2 },
  { id: 202, slug: "sillones",       name: "Sillones",          parentId: 2 },
  { id: 203, slug: "mesas-centro",   name: "Mesas de centro",   parentId: 2 },
  { id: 204, slug: "mesas-laterales",name: "Mesas laterales",   parentId: 2 },
  { id: 205, slug: "racks-tv",       name: "Racks TV",          parentId: 2 },
  { id: 206, slug: "estanterias",    name: "Estanterías",       parentId: 2 },

  // Subcategorías de Comedor (parentId: 3)
  { id: 301, slug: "mesas-comedor",  name: "Mesas de comedor",  parentId: 3 },
  { id: 302, slug: "sillas-comedor", name: "Sillas de comedor", parentId: 3 },
  { id: 303, slug: "bancas",         name: "Bancas",            parentId: 3 },
  { id: 304, slug: "arrimos",        name: "Arrimos",           parentId: 3 },
  { id: 305, slug: "vitrinas",       name: "Vitrinas",          parentId: 3 },

  // Subcategorías de Exterior (parentId: 4)
  { id: 401, slug: "mesas-exterior",  name: "Mesas exterior",   parentId: 4 },
  { id: 402, slug: "sillas-exterior", name: "Sillas exterior",  parentId: 4 },
  { id: 403, slug: "loungers",        name: "Loungers",         parentId: 4 },
  { id: 404, slug: "quitasoles",      name: "Quitasoles",       parentId: 4 },

  // Subcategorías de Oficina (parentId: 5)
  { id: 501, slug: "escritorios",   name: "Escritorios",   parentId: 5 },
  { id: 502, slug: "sillas-oficina",name: "Sillas oficina",parentId: 5 },
  { id: 503, slug: "bibliotecas",   name: "Bibliotecas",   parentId: 5 },
  { id: 504, slug: "archivadores",  name: "Archivadores",  parentId: 5 },

  // Subcategorías de Iluminación (parentId: 6)
  { id: 601, slug: "lamparas-pie",   name: "Lámparas de pie",   parentId: 6 },
  { id: 602, slug: "lamparas-mesa",  name: "Lámparas de mesa",  parentId: 6 },
  { id: 603, slug: "colgantes",      name: "Colgantes",         parentId: 6 },
  { id: 604, slug: "apliques",       name: "Apliques",          parentId: 6 },

  // Subcategorías de Decoración (parentId: 7)
  { id: 701, slug: "espejos",      name: "Espejos",      parentId: 7 },
  { id: 702, slug: "alfombras",    name: "Alfombras",    parentId: 7 },
  { id: 703, slug: "cojines",      name: "Cojines",      parentId: 7 },
  { id: 704, slug: "cuadros",      name: "Cuadros",      parentId: 7 },
  { id: 705, slug: "floreros",     name: "Floreros",     parentId: 7 },

  // Subcategorías de Almacenamiento (parentId: 8)
  { id: 801, slug: "estantes",     name: "Estantes",     parentId: 8 },
  { id: 802, slug: "closets",      name: "Closets",      parentId: 8 },
  { id: 803, slug: "organizadores",name: "Organizadores",parentId: 8 },
  { id: 804, slug: "baules",       name: "Baúles",       parentId: 8 },

  // Subcategorías de Textiles (parentId: 9)
  { id: 901, slug: "ropa-cama",    name: "Ropa de cama", parentId: 9 },
  { id: 902, slug: "mantas",       name: "Mantas",       parentId: 9 },
  { id: 903, slug: "fundas",       name: "Fundas",       parentId: 9 },
  { id: 904, slug: "cortinas",     name: "Cortinas",     parentId: 9 },
];


// ---------- Backend API  ----------
export const listCategories = () => CATEGORIES;

export const listProducts = ({ q = "", categoryId = null } = {}) => {
  const text = q.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    const matchText = !text || p.name.toLowerCase().includes(text);
    const matchCat = !categoryId || p.categoryIds?.includes(Number(categoryId));
    return matchText && matchCat;
  });
};

export const getProductById = (id) => PRODUCTS.find((p) => p.id === Number(id));
