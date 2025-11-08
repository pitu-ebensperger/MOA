export const CATEGORIES = [
  {
    id: 1000,
    slug: "living",
    name: "Living",
    description:
      "Piezas diseñadas para crear espacios sociales acogedores con materiales nobles y líneas suaves.",
    coverImage:
      "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fGJlZHJvb218ZW58MHx8MHx8fDI%3D&auto=format&fit=crop", // living room cálido
    parentId: null,
  },
  {
    id: 2000,
    slug: "comedor",
    name: "Comedor",
    description:
      "Mesas, sillas y accesorios que transforman cada comida en una experiencia memorable.",
    coverImage:
      "https://images.unsplash.com/photo-1583845112239-97ef1341b271?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGRpbmluZyUyMHJvb218ZW58MHx8MHx8fDI%3D&auto=format&fit=crop", // comedor real con mesa/sillas
    parentId: null,
  },
  {
    id: 3000,
    slug: "dormitorio",
    name: "Dormitorio",
    description:
      "Muebles y textiles que invitan al descanso, con énfasis en texturas suaves y tonos neutros.",
    coverImage:
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop", // cama/tapizado tonos neutros
    parentId: null,
  },
  {
    id: 4000,
    slug: "iluminacion",
    name: "Iluminación",
    description:
      "Lámparas de autor y luminarias funcionales que resaltan la calidez de cada ambiente.",
    coverImage:
      "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxhbXB8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=800", // colgantes/lámparas
    parentId: null,
  },
  {
    id: 5000,
    slug: "oficina",
    name: "Oficina",
    description:
      "Soluciones ergonómicas y versátiles para espacios de trabajo creativos y funcionales.",
    coverImage:
      "https://images.unsplash.com/photo-1616593918824-4fef16054381?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGhvbWUlMjBvZmZpY2V8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&q=60&w=800", // escritorio/silla office
    parentId: null,
  },
   {
    id: 6000,
    slug: "decoracion",
    name: "Decoración",
    description:
      "Colecciones que aportan estilo y personalidad a cada rincón del hogar.",
    coverImage:
      "https://images.unsplash.com/photo-1514053026555-49ce8886ae41?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop", // terraza/jardín
    parentId: null,
  },
];

export const SUBCATEGORIES = [
  // Living (1)
  { id: 1100, slug: "sofas",            name: "Sofás",            parentId: 1000 },
  { id: 1200, slug: "sillones",         name: "Sillones",         parentId: 1000 },
  { id: 1300, slug: "mesas-centro",     name: "Mesas de centro",  parentId: 1000 },
  { id: 1400, slug: "mesas-laterales",  name: "Mesas laterales",  parentId: 1000 },

  // Comedor (2)
  { id: 2100, slug: "mesas-comedor",    name: "Mesas de comedor", parentId: 2000 },
  { id: 2200, slug: "sillas-comedor",   name: "Sillas de comedor",parentId: 2000 },
  { id: 2300, slug: "aparadores",       name: "Aparadores",       parentId: 2000 },

  // Dormitorio (3)
  { id: 3100, slug: "camas",            name: "Camas",            parentId: 3000 },
  { id: 3200, slug: "veladores",        name: "Veladores",        parentId: 3000 },
  { id: 3300, slug: "textiles",         name: "Textiles",         parentId: 3000 },

  // Iluminación (4)
  { id: 4100, slug: "lamparas-techo",   name: "Lámparas de techo",parentId: 4000 },
  { id: 4200, slug: "lamparas-mesa",    name: "Lámparas de mesa", parentId: 4000 },

  // Oficina (5)
  { id: 5100, slug: "escritorios",      name: "Escritorios",      parentId: 5000 },
  { id: 5200, slug: "sillas-oficina",   name: "Sillas de oficina",parentId: 5000},

  // Decoración (6)
  { id: 6100, slug: "plantas", name: "Plantas", parentId: 6000 },
  { id: 6200, slug: "espejos",  name: "Espejos",  parentId: 6000 },
];

export const categoriesDb = {
  CATEGORIES,
  categories: CATEGORIES,
  SUBCATEGORIES,
  subcategories: SUBCATEGORIES,
};
