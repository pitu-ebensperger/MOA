export const contentDb = {
  home: {
    featuredCategoryIds: [1000, 2000, 3000, 4000],
    featuredProductIds: [11001, 21001, 31001, 41001, 20301],
    
    editorialSections: [
      {
        id: "atelier-story",
        title: "Colección Atelier",
        description:
          "Geometrías curvas, tapices de lino y maderas certificadas. La colección Atelier celebra lo artesanal con una mirada contemporánea.",
        image:
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop",
        cta: { label: "Ver piezas destacadas", href: "/products?collection=coleccion-atelier" },
      },
      {
        id: "bruma-living",
        title: "Living en capas suaves",
        description:
          "Sofás modulares con fundas lavables, mesas en fresno y lámparas en lino que aportan calidez inmediata.",
        image:
          "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
        cta: { label: "Inspiración living", href: "/lookbook/living" },
      },
    ],
  },
  
  navigation: {
    primary: [
      { id: "nav-living", label: "Living", href: "/products?category=living" },
      { id: "nav-comedor", label: "Comedor", href: "/products?category=comedor" },
      { id: "nav-dormitorio", label: "Dormitorio", href: "/products?category=dormitorio" },
      { id: "nav-iluminacion", label: "Iluminación", href: "/products?category=iluminacion" },
      { id: "nav-oficina", label: "Oficina", href: "/products?category=oficina" },
      { id: "nav-exterior", label: "Exterior", href: "/products?category=exterior" },
    ],
  },
};
