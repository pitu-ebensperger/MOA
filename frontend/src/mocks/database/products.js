const coerceNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const firstDefined = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return null;
};

const slugify = (value) => {
  if (!value) return null;
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeProductRecord = (product = {}, index) => {
  const resolvedId =
    firstDefined(product.id, product.productId, product.product_id, coerceNumber(product.sku)) ??
    index + 1;

  const name =
    firstDefined(product.name, product.nombre, product.title, product.slug) ??
    `Producto ${index + 1}`;

  const slug =
    firstDefined(product.slug, slugify(name), resolvedId !== null ? String(resolvedId) : null) ??
    `product-${index + 1}`;

  const price = coerceNumber(
    firstDefined(
      product.price,
      product.precio,
      product.priceCLP,
      product.precioCLP,
      product?.pricing?.price,
    ),
  );

  const compareAtPrice = coerceNumber(
    firstDefined(product.compareAtPrice, product.precio_original, product.precioNormal),
  );

  const imageUrl =
    firstDefined(product.imageUrl, product.imagen_url, product.image, product.coverImage) ?? null;

  const gallery =
    Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : imageUrl
        ? [imageUrl]
        : [];

  const categoryId = firstDefined(
    product.categoryId,
    product.fk_categoria_id,
    product.categoria_id,
  );

  const categoryIds =
    Array.isArray(product.categoryIds) && product.categoryIds.length
      ? product.categoryIds
      : categoryId !== undefined && categoryId !== null
        ? [categoryId]
        : [];

  const collectionIds =
    Array.isArray(product.collectionIds) && product.collectionIds.length
      ? product.collectionIds
      : product.categoria_slug
        ? [product.categoria_slug]
        : [];

  const stock = coerceNumber(product.stock) ?? 0;

  const sku =
    firstDefined(product.sku, product.codigo) ??
    (resolvedId !== undefined && resolvedId !== null ? `SKU-${resolvedId}` : `SKU-${index + 1}`);

  return {
    ...product,
    id: resolvedId,
    slug,
    name,
    title: product.title ?? name,
    shortDescription: product.shortDescription ?? product.descripcion ?? "",
    description: product.description ?? product.descripcion ?? "",
    price: price ?? null,
    priceCLP: price ?? product.priceCLP ?? product.precioCLP ?? null,
    compareAtPrice: compareAtPrice ?? null,
    imageUrl,
    imagen_url: product.imagen_url ?? imageUrl,
    gallery,
    categoryId: categoryId ?? null,
    categoryIds,
    collectionIds,
    stock,
    sku,
  };
};

const RAW_PRODUCTS = [
  // Living
  {
    id: 11001,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Sofá Modular Lino Arena",
    descripcion: "Módulos combinables, tapizado en lino tono arena; líneas suaves y cojines blandos.",
    precio: 459990,
    stock: 6,
    sku: "LIV-SOFAMODU-20101",
    imagen_url:
      "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11002,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Mesa de Centro Roble Natural",
    descripcion: "Tablero macizo con borde orgánico; base metálica minimal.",
    precio: 189990,
    stock: 10,
    sku: "LIV-MESACENT-20102",
    imagen_url:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11003,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Alfombra Yute & Algodón",
    descripcion: "Tejido cálido bicolor para capas; textura natural.",
    precio: 129990,
    stock: 12,
    sku: "LIV-ALFOMBRA-20103",
    imagen_url:
      "https://images.unsplash.com/photo-1556910096-6f5e72db6802?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11004,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Rack TV Fresno Bajo",
    descripcion: "Mueble bajo en fresno con puertas lisas y pata cónica.",
    precio: 239990,
    stock: 8,
    sku: "LIV-RACKTVFR-20104",
    imagen_url:
      "https://images.unsplash.com/photo-1600585154510-8e89f5a2e1f1?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11005,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Sillón Bouclé Marfil",
    descripcion: "Curvas envolventes y tela bouclé; rincón de lectura perfecto.",
    precio: 219990,
    stock: 7,
    sku: "LIV-SILLONBO-20105",
    imagen_url:
      "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11006,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Mesas Nido (Set x2)",
    descripcion: "Par de mesas livianas en madera clara para apoyo flexible.",
    precio: 139990,
    stock: 15,
    sku: "LIV-MESASNID-20106",
    imagen_url:
      "https://images.unsplash.com/photo-1598300183876-573f42e1d1f8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11007,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Biblioteca Abierta 5 Repisas",
    descripcion: "Estantería ligera para libros, plantas y objetos.",
    precio: 259990,
    stock: 5,
    sku: "LIV-BIBLIOTE-20107",
    imagen_url:
      "https://images.unsplash.com/photo-1600585154209-c3d27e7b1a5b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11008,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Puf Trenzado Algodón",
    descripcion: "Puf bajo con funda trenzada en tono beige.",
    precio: 69990,
    stock: 20,
    sku: "LIV-PUFTRENZ-20108",
    imagen_url:
      "https://images.unsplash.com/photo-1597047084897-51e81819a499?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11009,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Mesa Lateral Disco",
    descripcion: "Superficie redonda en metal pintado mate; acento moderno.",
    precio: 79990,
    stock: 18,
    sku: "LIV-MESALATE-20109",
    imagen_url:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 11010,
    fk_categoria_id: 1,
    categoria_slug: "living",
    nombre: "Manta Cashmere Blend",
    descripcion: "Manta suave con flecos finos en tono crema.",
    precio: 89990,
    stock: 25,
    sku: "LIV-MANTACAS-20110",
    imagen_url:
      "https://images.unsplash.com/photo-1604335399105-a0c19c68bdb0?q=80&w=1600&auto=format&fit=crop",
  },
  // Comedor
  {
    id: 21001,
    fk_categoria_id: 2,
    categoria_slug: "comedor",
    nombre: "Mesa Comedor Roble",
    descripcion: "Mesa de comedor de roble con acabado natural; capacidad para 6 personas.",
    precio: 399990,
    stock: 5,
    sku: "COM-MESAROB-2101",
    imagen_url:
      "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 22001,
    fk_categoria_id: 2,
    categoria_slug: "comedor",
    nombre: "Silla Comedor Tapizada",
    descripcion: "Silla de comedor tapizada en tela resistente; patas de madera.",
    precio: 99990,
    stock: 10,
    sku: "COM-SILLATAP-2201",
    imagen_url:
      "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=1600&auto=format&fit=crop",
  },
  // Dormitorio
  {
    id: 31001,
    fk_categoria_id: 3,
    categoria_slug: "dormitorio",
    nombre: "Cama Queen Roble + Cabecera Tela",
    descripcion: "Estructura en roble con cabecera tapizada en lino natural.",
    precio: 499990,
    stock: 4,
    sku: "DOR-CAMAQUEE-20201",
    imagen_url:
      "https://images.unsplash.com/photo-1616596878578-c3b3f9c9bfaa?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 32002,
    fk_categoria_id: 3,
    categoria_slug: "dormitorio",
    nombre: "Velador Rústico",
    descripcion: "Velador compacto en madera envejecida con cajón oculto para esenciales.",
    precio: 89990,
    stock: 10,
    sku: "DOR-VELARRUS-32002",
    imagen_url:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxib29rbWFya3MtcGFnZXw2OXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=800",
  },
  {
    id: 32003,
    fk_categoria_id: 3,
    categoria_slug: "dormitorio",
    nombre: "Mesilla blanca con acentos de madera",
    descripcion:
      "Mesa lateral lacada en blanco con repisa inferior y detalles en roble natural.",
    precio: 74990,
    stock: 16,
    sku: "DOR-MESILLAB-32003",
    imagen_url:
      "https://images.unsplash.com/photo-1499933374294-4584851497cc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
  },
  // Iluminación
  {
    id: 41001,
    fk_categoria_id: 4,
    categoria_slug: "iluminacion",
    fk_subcategoria_id: 4100,
    nombre: "Lámpara Colgante Globo Opal",
    descripcion:
      "Luminaria colgante con difusor de vidrio opal y herrajes metálicos en tono dorado.",
    precio: 149990,
    stock: 12,
    sku: "ILU-COLGLOBO-20406",
    imagen_url:
      "https://images.unsplash.com/photo-1600421684846-e7ebc943403b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxib29rbWFya3MtcGFnZXw1OXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=800",
    specs: { diametro_cm: 30, voltaje: "220–240V", casquillo: "E27" },
    tags: ["colgante", "vidrio opal", "luz cálida", "moderno"],
  },
  {
    id: 42002,
    fk_categoria_id: 4,
    categoria_slug: "iluminacion",
    fk_subcategoria_id: 4200,
    nombre: "Lámpara de Mesa Textil Plisado",
    descripcion:
      "Base cerámica en tono crema con pantalla plisada de lino. Ideal para veladores o rincones de lectura.",
    precio: 89990,
    stock: 15,
    sku: "ILU-MESAPLI-20407",
    imagen_url:
      "https://images.unsplash.com/photo-1579656618142-5192f72e2d3d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxib29rbWFya3MtcGFnZXw2M3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=800",
    specs: { altura_cm: 45, voltaje: "220–240V", casquillo: "E14" },
    tags: ["mesa", "pantalla textil", "cerámica", "cálido"],
  },
  // Oficina
  {
    id: 20301,
    fk_categoria_id: 5,
    categoria_slug: "oficina",
    nombre: "Escritorio de Madera Maciza Fresno",
    descripcion:
      "Escritorio minimalista en madera maciza de fresno con acabado mate. Superficie amplia y líneas limpias; ideal para un home office cálido y funcional.",
    precio: 189990,
    stock: 8,
    sku: "HOM-ESCRITOR-20306",
    imagen_url:
      "https://images.unsplash.com/photo-1646003607550-4b1b62e3a2d4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxib29rbWFya3MtcGFnZXwzOHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=800",
  },
  // Decoración
  {
    id: 62001,
    fk_categoria_id: 6000,
    categoria_slug: "decoracion",
    nombre: "Espejo Redondo Marco Madera",
    descripcion:
      "Espejo decorativo redondo con marco de madera natural y acabado mate. Aporta luz y profundidad a living, dormitorio o pasillos, realzando una estética cálida y minimalista.",
    precio: 129990,
    stock: 9,
    sku: "DEC-ESPEJORD-20610",
    imagen_url:
      "https://images.unsplash.com/photo-1598116132066-b730a4f8616a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxib29rbWFya3MtcGFnZXw0Nnx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=800",
    tags: ["madera", "minimal", "redondo", "decoración mural"],
  },
];

export const PRODUCTS = RAW_PRODUCTS.map(normalizeProductRecord);

export const productsDb = {
  PRODUCTS,
  products: PRODUCTS,
  collections: [],
};
