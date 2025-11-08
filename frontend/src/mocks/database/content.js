export const contentDb = {
  home: {
    featuredCategoryIds: [1, 2, 3, 4],
    featuredProductIds: [201, 101, 103, 301],
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
    testimonials: [
      {
        id: "review-camila",
        name: "Camila López",
        role: "Arquitecta interior",
        quote:
          "La flexibilidad modular del sofá Bruma nos permitió diseñar un living cálido sin sacrificar funcionalidad. La calidad de los materiales se nota en cada detalle.",
      },
      {
        id: "review-diego",
        name: "Diego Pizarro",
        role: "Director creativo",
        quote:
          "Trabajar con MOA simplificó nuestros proyectos comerciales: entregas puntuales y piezas que envejecen muy bien con el uso.",
      },
    ],
    contact: {
      showroomAddress: "Av. Italia 1439, Providencia, Santiago",
      openingHours: "Lunes a sábado · 10:00 – 19:00",
      phone: "+56 2 2791 6543",
      whatsapp: "+56 9 5678 1234",
      email: "hola@moa-studio.cl",
      mapUrl:
        "https://www.google.com/maps/place/Av.+Italia+1439,+Providencia,+Región+Metropolitana",
      formIntroduction:
        "Coordina una visita al showroom o solicita asesoría remota con nuestro equipo creativo.",
    },
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
    secondary: [
      { id: "nav-lookbook", label: "Lookbook", href: "/lookbook" },
      { id: "nav-about", label: "Nuestro proceso", href: "/about" },
      { id: "nav-contract", label: "Clientes contract", href: "/contract" },
      { id: "nav-journal", label: "Journal", href: "/journal" },
    ],
  },
};
