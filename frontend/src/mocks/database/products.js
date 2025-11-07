export const productsDb = {
  CATEGORIES: [
    // Categorías raíz
    {
      id: 1,
      slug: "living",
      name: "Living",
      parentId: null,
      description:
        "Piezas diseñadas para crear espacios sociales acogedores con materiales nobles y líneas suaves.",
      coverImage:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 2,
      slug: "comedor",
      name: "Comedor",
      parentId: null,
      description:
        "Mesas, sillas y accesorios que transforman cada comida en una experiencia memorable.",
      coverImage:
        "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 3,
      slug: "dormitorio",
      name: "Dormitorio",
      parentId: null,
      description:
        "Muebles y textiles que invitan al descanso, con énfasis en texturas suaves y tonos neutros.",
      coverImage:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 4,
      slug: "iluminacion",
      name: "Iluminación",
      parentId: null,
      description:
        "Lámparas de autor y luminarias funcionales que resaltan la calidez de cada ambiente.",
      coverImage:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 5,
      slug: "oficina",
      name: "Oficina",
      parentId: null,
      description:
        "Soluciones ergonómicas y versátiles para espacios de trabajo creativos y funcionales.",
      coverImage:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 6,
      slug: "exterior",
      name: "Exterior",
      parentId: null,
      description:
        "Colecciones resistentes al clima que llevan la estética del hogar a terrazas y jardines.",
      coverImage:
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
    },

    // Subcategorías Living
    {
      id: 201,
      slug: "sofas",
      name: "Sofás",
      parentId: 1,
    },
    {
      id: 202,
      slug: "sillones",
      name: "Sillones",
      parentId: 1,
    },
    {
      id: 203,
      slug: "mesas-centro",
      name: "Mesas de centro",
      parentId: 1,
    },

    // Subcategorías Comedor
    {
      id: 301,
      slug: "mesas-comedor",
      name: "Mesas de comedor",
      parentId: 2,
    },
    {
      id: 302,
      slug: "sillas-comedor",
      name: "Sillas de comedor",
      parentId: 2,
    },
    {
      id: 303,
      slug: "aparadores",
      name: "Aparadores",
      parentId: 2,
    },

    // Subcategorías Dormitorio
    {
      id: 401,
      slug: "camas",
      name: "Camas",
      parentId: 3,
    },
    {
      id: 402,
      slug: "veladores",
      name: "Veladores",
      parentId: 3,
    },
    {
      id: 403,
      slug: "textiles",
      name: "Textiles",
      parentId: 3,
    },

    // Subcategorías Iluminación
    {
      id: 501,
      slug: "lamparas-techo",
      name: "Lámparas de techo",
      parentId: 4,
    },
    {
      id: 502,
      slug: "lamparas-mesa",
      name: "Lámparas de mesa",
      parentId: 4,
    },

    // Subcategorías Oficina
    {
      id: 601,
      slug: "escritorios",
      name: "Escritorios",
      parentId: 5,
    },
    {
      id: 602,
      slug: "sillas-oficina",
      name: "Sillas de oficina",
      parentId: 5,
    },

    // Subcategorías Exterior
    {
      id: 701,
      slug: "comedor-exterior",
      name: "Comedor exterior",
      parentId: 6,
    },
    {
      id: 702,
      slug: "lounge-exterior",
      name: "Lounge exterior",
      parentId: 6,
    },
  ],

  PRODUCTS: [
    {
      id: 101,
      slug: "silla-comedor-roble-curvo",
      sku: "CHA-ROBLE-01",
      name: "Silla comedor roble curvo",
      shortDescription: "Estructura sólida de roble, respaldo ergonómico y tapiz de lino natural.",
      description:
        "Nuestra silla comedor roble curvo combina carpintería tradicional con un diseño contemporáneo. "
        + "El respaldo envolvente brinda soporte lumbar, mientras el tapiz de lino natural aporta textura y calidez. "
        + "Ideal para comedores que buscan piezas duraderas y atemporales.",
      price: 129_990,
      compareAtPrice: 149_990,
      currency: "CLP",
      rating: 4.8,
      reviewCount: 26,
      badges: ["Nuevo ingreso"],
      tags: ["madera maciza", "tapizado", "artesanal"],
      categoryIds: [2, 302],
      collectionIds: ["coleccion-atelier"],
      imageUrl:
        "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "roble", name: "Roble", colorHex: "#b08968", stock: 6 },
        { id: "nogal", name: "Nogal", colorHex: "#6b4f3a", stock: 4 },
        { id: "negro", name: "Negro", colorHex: "#222222", stock: 2 },
      ],
      materials: ["Madera de roble certificada FSC", "Tapiz lino europeo", "Barniz al agua"],
      dimensions: { width: 52, depth: 57, height: 84, seatHeight: 45, unit: "cm" },
      weightKg: 6.5,
      careInstructions:
        "Limpiar con paño ligeramente húmedo. Evitar exposición continua a luz directa. Volver a tapizar profesionalmente cada 5 años.",
      inventoryStatus: {
        stock: 12,
        incomingUnits: 8,
        lowStockThreshold: 3,
      },
      shipping: {
        leadTimeDays: 5,
        provider: "Despacho premium",
        boxDimensions: { width: 60, depth: 64, height: 90, unit: "cm" },
        weightKg: 8,
      },
      seo: {
        title: "Silla comedor roble curvo | MOA Design",
        description:
          "Silla de comedor artesanal en roble curvo con tapiz de lino. Diseño cálido y ergonómico para espacios contemporáneos.",
        keywords: ["silla comedor", "roble curvo", "muebles artesanales"],
      },
      createdAt: "2024-02-15T10:00:00Z",
      updatedAt: "2024-04-20T08:30:00Z",
    },
    {
      id: 102,
      slug: "lampara-cupula-lino-natural",
      sku: "LAMP-SUSP-02",
      name: "Lámpara cúpula lino natural",
      shortDescription: "Pantalla textil orgánica con difusor acrílico para luz homogénea.",
      description:
        "La lámpara cúpula lino natural transforma la iluminación ambiental con una pantalla textil tensada "
        + "sobre estructura metálica. Su difusor inferior suaviza la luz, ideal para comedores o livings "
        + "que buscan atmósferas cálidas y balanceadas.",
      price: 59_990,
      currency: "CLP",
      rating: 4.6,
      reviewCount: 14,
      badges: ["Más vendido"],
      tags: ["iluminación colgante", "lino", "artesanal"],
      categoryIds: [4, 501],
      collectionIds: ["coleccion-atelier"],
      imageUrl:
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "lino-natural", name: "Lino Natural", colorHex: "#d9cab3", stock: 8 },
        { id: "lino-carbon", name: "Lino Carbón", colorHex: "#4b4b4b", stock: 5 },
      ],
      materials: ["Lino belga", "Estructura acero pintado", "Cable textil"],
      dimensions: { diameter: 42, height: 32, unit: "cm" },
      weightKg: 2.3,
      careInstructions:
        "Aspirar suavemente con accesorio de tela. Evitar limpiar con productos abrasivos. Reemplazar ampolleta LED 9W cálida.",
      inventoryStatus: {
        stock: 13,
        incomingUnits: 20,
        lowStockThreshold: 5,
      },
      shipping: {
        leadTimeDays: 3,
        provider: "Logística estándar",
        boxDimensions: { width: 45, depth: 45, height: 36, unit: "cm" },
        weightKg: 3.5,
      },
      seo: {
        title: "Lámpara cúpula lino natural | MOA Lighting",
        description:
          "Lámpara colgante con pantalla de lino natural y difusor acrílico. Iluminación cálida ideal para comedores y livings.",
        keywords: ["lámpara lino", "iluminación cálida", "pantalla textil"],
      },
      createdAt: "2024-01-22T12:00:00Z",
      updatedAt: "2024-03-02T09:15:00Z",
    },
    {
      id: 103,
      slug: "mesa-lateral-minimal",
      sku: "SID-TBL-03",
      name: "Mesa lateral minimal fresno",
      shortDescription: "Mesa auxiliar con sobre laqueado y estructura metálica ultrafina.",
      description:
        "Mesa lateral minimal con cubierta de fresno americano certificado y patas metálicas con acabado powder coat. "
        + "Perfecta para acompañar sofás o como soporte decorativo gracias a su perfil delgado y proporciones equilibradas.",
      price: 89_990,
      currency: "CLP",
      rating: 4.7,
      reviewCount: 18,
      badges: ["Edición limitada"],
      tags: ["mesa auxiliar", "minimalista", "fresno"],
      categoryIds: [1, 203],
      collectionIds: ["coleccion-atelier"],
      imageUrl:
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1479705879471-5afa9936c970?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "arena", name: "Arena", colorHex: "#d2b48c", stock: 4 },
        { id: "gris", name: "Gris", colorHex: "#9ca3af", stock: 6 },
      ],
      materials: ["Fresno americano", "Acero pintado", "Laca poliuretánica mate"],
      dimensions: { width: 45, depth: 45, height: 55, unit: "cm" },
      weightKg: 5.2,
      careInstructions:
        "Limpiar con paño húmedo y secar inmediatamente. Usar posavasos para proteger la superficie.",
      inventoryStatus: {
        stock: 10,
        incomingUnits: 5,
        lowStockThreshold: 2,
      },
      shipping: {
        leadTimeDays: 4,
        provider: "Despacho premium",
        boxDimensions: { width: 50, depth: 50, height: 60, unit: "cm" },
        weightKg: 6,
      },
      seo: {
        title: "Mesa lateral minimal en fresno | MOA Living",
        description:
          "Mesa auxiliar minimalista con sobre de fresno y patas metálicas. Diseño equilibrado para livings contemporáneos.",
        keywords: ["mesa lateral", "muebles living", "diseño minimalista"],
      },
      createdAt: "2024-03-05T09:45:00Z",
      updatedAt: "2024-03-28T15:20:00Z",
    },
    {
      id: 201,
      slug: "sofa-modular-lino-niebla",
      sku: "SOF-MOD-01",
      name: "Sofá modular lino niebla",
      shortDescription: "Módulos configurables con fundas lavables y asiento de espuma de alta densidad.",
      description:
        "El sofá modular lino niebla permite crear configuraciones personalizadas. Incluye módulos chaise y esquina "
        + "con estructura de eucalipto seco y suspensión con cintas elásticas importadas. Fundas completamente removibles.",
      price: 1_249_000,
      compareAtPrice: 1_349_000,
      currency: "CLP",
      rating: 4.9,
      reviewCount: 42,
      badges: ["Destacado"],
      tags: ["modular", "lavable", "hecho a mano"],
      categoryIds: [1, 201],
      collectionIds: ["coleccion-bruma"],
      imageUrl:
        "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616627562481-61bb75e21808?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "niebla", name: "Lino niebla", colorHex: "#d5d8d7", stock: 3 },
        { id: "tierra", name: "Lino tierra", colorHex: "#b79d82", stock: 2 },
      ],
      configuration: {
        modules: [
          { id: "central", name: "Central", width: 90, depth: 95, height: 78 },
          { id: "esquina", name: "Esquina", width: 95, depth: 95, height: 78 },
          { id: "chaise", name: "Chaise largo", width: 95, depth: 155, height: 78 },
        ],
      },
      materials: ["Eucalipto macizo", "Espuma alta resiliencia", "Pluma reciclada", "Lino europeo"],
      dimensions: { width: 285, depth: 155, height: 78, unit: "cm" },
      weightKg: 84,
      careInstructions:
        "Lavar las fundas en ciclo delicado con agua fría. Reacomodar los cojines semanalmente para mantener el volumen.",
      inventoryStatus: {
        stock: 5,
        incomingUnits: 4,
        lowStockThreshold: 1,
      },
      shipping: {
        leadTimeDays: 12,
        provider: "Logística especializada",
        boxDimensions: { width: 120, depth: 100, height: 80, unit: "cm" },
        weightKg: 95,
      },
      seo: {
        title: "Sofá modular lino niebla | MOA Studio",
        description:
          "Sofá modular personalizable con fundas lavables y espuma de alta densidad. Ideal para livings amplios.",
        keywords: ["sofá modular", "fundas lavables", "living diseño"],
      },
      createdAt: "2024-02-01T14:10:00Z",
      updatedAt: "2024-04-15T13:05:00Z",
    },
    {
      id: 301,
      slug: "aparador-escandinavo-de-3-puertas",
      sku: "BUF-OAK-02",
      name: "Aparador escandinavo de 3 puertas",
      shortDescription: "Módulo bajo con puertas enmarcadas y compartimentos configurables.",
      description:
        "Aparador inspirado en carpintería escandinava con puertas enmarcadas y sistema soft-close. "
        + "Incluye compartimentos ajustables y módulo bar central, construido con roble europeo y frentes en enchapado natural.",
      price: 649_000,
      currency: "CLP",
      rating: 4.8,
      reviewCount: 31,
      badges: ["Hecho a pedido"],
      tags: ["almacenamiento", "soft-close", "enchapado roble"],
      categoryIds: [2, 303],
      collectionIds: ["coleccion-bruma"],
      imageUrl:
        "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "roble-miel", name: "Roble miel", colorHex: "#c89f73", stock: 2 },
        { id: "roble-carbon", name: "Roble carbón", colorHex: "#52443e", stock: 1 },
      ],
      materials: ["Roble europeo", "MDF con enchapado natural", "Tiradores cuero curtido vegetal"],
      dimensions: { width: 180, depth: 45, height: 80, unit: "cm" },
      weightKg: 58,
      careInstructions:
        "Limpiar con cera natural cada 6 meses. Evitar humedad directa. Reapretar herrajes de puertas cada año.",
      inventoryStatus: {
        stock: 3,
        incomingUnits: 3,
        lowStockThreshold: 1,
      },
      shipping: {
        leadTimeDays: 10,
        provider: "Despacho premium",
        boxDimensions: { width: 190, depth: 55, height: 90, unit: "cm" },
        weightKg: 65,
      },
      seo: {
        title: "Aparador escandinavo 3 puertas | MOA Dining",
        description:
          "Aparador bajo de roble con puertas soft-close y compartimentos configurables. Pieza central para comedores cálidos.",
        keywords: ["aparador roble", "soft close", "muebles comedor"],
      },
      createdAt: "2024-02-20T08:00:00Z",
      updatedAt: "2024-04-18T11:35:00Z",
    },
    {
      id: 401,
      slug: "cama-marco-tapizado-nubes",
      sku: "BED-TEX-01",
      name: "Cama marco tapizado nubes",
      shortDescription: "Estructura baja con cabezal capitoné y base reforzada para colchones premium.",
      description:
        "La cama marco tapizado nubes ofrece una silueta envolvente con cabezal capitoné y detalles de costura vistos. "
        + "Construida con madera de lenga y espuma de alta densidad, disponible en tonalidades neutras para combinar con cualquier estilo.",
      price: 879_000,
      currency: "CLP",
      rating: 4.9,
      reviewCount: 22,
      badges: ["Top ventas"],
      tags: ["tapizado", "dormitorio", "capitoné"],
      categoryIds: [3, 401],
      collectionIds: ["coleccion-nido"],
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1616594039964-40b6ba4c867c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop",
      ],
      variantOptions: [
        { id: "lino-perla", name: "Lino perla", colorHex: "#dedad4", stock: 4 },
        { id: "lino-grafito", name: "Lino grafito", colorHex: "#6d6c6c", stock: 2 },
      ],
      materials: ["Madera lenga", "Espuma HR", "Tapiz lino & algodón"],
      dimensions: { width: 170, depth: 215, height: 110, unit: "cm" },
      weightKg: 72,
      careInstructions:
        "Aspirar con accesorio suave semanalmente. En caso de manchas, limpiar puntualmente con espuma seca.",
      inventoryStatus: {
        stock: 6,
        incomingUnits: 4,
        lowStockThreshold: 2,
      },
      shipping: {
        leadTimeDays: 14,
        provider: "Logística especializada",
        boxDimensions: { width: 180, depth: 40, height: 120, unit: "cm" },
        weightKg: 80,
      },
      seo: {
        title: "Cama marco tapizado nubes | MOA Night",
        description:
          "Cama tapizada con cabezal capitoné y base reforzada. Diseño suave para dormitorios contemporáneos.",
        keywords: ["cama tapizada", "dormitorio premium", "capitone"],
      },
      createdAt: "2024-03-12T10:30:00Z",
      updatedAt: "2024-04-12T09:00:00Z",
    },
  ],

  collections: [
    {
      id: "coleccion-atelier",
      name: "Colección Atelier",
      descripXFtion:
        "Selección de piezas funcionales para espacios compactos, enfocadas en materiales naturales y líneas orgánicas.",
      heroImage:
        "https://images.unsplash.com/photo-1486946255434-2466348c2166?q=80&w=1600&auto=format&fit=crop",
      productIds: [101, 102, 103],
      spotlightCopy: "Elementos versátiles para comedores luminosos y livings que invitan a quedarse.",
    },
    {
      id: "coleccion-bruma",
      name: "Colección Bruma",
      description:
        "Volúmenes suaves y tapices lavables pensados para ambientes sociales y familiares de alto tránsito.",
      heroImage:
        "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
      productIds: [201, 301],
      spotlightCopy: "Diseños modulables que se adaptan a la rutina diaria sin perder elegancia.",
    },
    {
      id: "coleccion-nido",
      name: "Colección Nido",
      description:
        "Dormitorios envolventes con énfasis en texturas táctiles, iluminación suave y sensación de descanso profundo.",
      heroImage:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop",
      productIds: [401],
      spotlightCopy: "Capas y textiles neutros que reconfortan desde el primer contacto.",
    },
  ],
};
