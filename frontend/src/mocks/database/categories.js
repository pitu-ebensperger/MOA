// Sistema id = 0000 
// (0)000 > CategoriasPrincipales 1 a 9) > 1000 Living, 2000 Comedor, 3000 Dormitorio,...
// 0(0)00 > Subcategorías 1 a 9 > 1100 Sofás, 1200 Sillones... 2100 Mesas de comedor, 2200 Sillas de comedor...
// 00(00) > Productos 01 a 09 > 1101 Sofá moderno, 2202 Silla de comedor, 3303 Mesa de comedor...

// Ejemplo: id 1203 > 1 (Categoría Principal: Living) 2 (Subcategoría: Sillones) 03 (Producto: Sillón escandinavo)


const database = {
    categories: [
    // Categorías Principales -------------------------------------------------------------------------------------
      {
        id: 1000,
        slug: "living",
        name: "Living",
        parentId: null,
        description:
          "Piezas diseñadas para crear espacios sociales acogedores con materiales nobles y líneas suaves.",
        coverImage:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: 200,
        slug: "comedor",
        name: "Comedor",
        parentId: null,
        description:
          "Mesas, sillas y accesorios que transforman cada comida en una experiencia memorable.",
        coverImage:
          "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: 300,
        slug: "dormitorio",
        name: "Dormitorio",
        parentId: null,
        description:
          "Muebles y textiles que invitan al descanso, con énfasis en texturas suaves y tonos neutros.",
        coverImage:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: 400,
        slug: "iluminacion",
        name: "Iluminación",
        parentId: null,
        description:
          "Lámparas de autor y luminarias funcionales que resaltan la calidez de cada ambiente.",
        coverImage:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: 500,
        slug: "oficina",
        name: "Oficina",
        parentId: null,
        description:
          "Soluciones ergonómicas y versátiles para espacios de trabajo creativos y funcionales.",
        coverImage:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
      },
      {
        id: 600,
        slug: "exterior",
        name: "Exterior",
        parentId: null,
        description:
          "Colecciones resistentes al clima que llevan la estética del hogar a terrazas y jardines.",
        coverImage:
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop",
      },




      // Subcategorías -------------------------------------------------------------------------------------
      
      // Subcategorías Living
      {
        id: 110,
        slug: "sofas",
        name: "Sofás",
        parentId: 1,
      },
      {
        id: 120,
        slug: "sillones",
        name: "Sillones",
        parentId: 1,
      },
      {
        id: 130,
        slug: "mesas-centro",
        name: "Mesas de centro",
        parentId: 1,
      },
  
      // Subcategorías Comedor
      {
        id: 210,
        slug: "mesas-comedor",
        name: "Mesas de comedor",
        parentId: 2,
      },
      {
        id: 220,
        slug: "sillas-comedor",
        name: "Sillas de comedor",
        parentId: 2,
      },
      {
        id: 220,
        slug: "aparadores",
        name: "Aparadores",
        parentId: 2,
      },
  
      // Subcategorías Dormitorio
      {
        id: 310,
        slug: "camas",
        name: "Camas",
        parentId: 3,
      },
      {
        id: 320,
        slug: "veladores",
        name: "Veladores",
        parentId: 3,
      },
      {
        id: 330,
        slug: "textiles",
        name: "Textiles",
        parentId: 3,
      },
  
      // Subcategorías Iluminación
      {
        id: 410,
        slug: "lamparas-techo",
        name: "Lámparas de techo",
        parentId: 4,
      },
      {
        id: 4,
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
  };
  
  export default database;
