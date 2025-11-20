export const cartsDb = {
  metadata: {
    lastSyncAt: "2024-04-18T08:00:00Z",
    total: 2,
  },
  carts: [
    {
      id: "cart-001",
      userId: "usr-001",
      items: [
        {
          id: "cart-item-001",
          productId: "prod-001",
          name: "Mesa de Roble Macizo",
          price: 450000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
          category: "Mesas",
        },
        {
          id: "cart-item-002",
          productId: "prod-005",
          name: "Silla Nórdica",
          price: 89000,
          quantity: 4,
          image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400",
          category: "Sillas",
        },
      ],
      subtotal: 806000,
      tax: 153140,
      total: 959140,
      createdAt: "2024-04-15T10:30:00Z",
      updatedAt: "2024-04-17T14:20:00Z",
    },
    {
      id: "cart-demo",
      userId: "usr-demo",
      items: [
        {
          id: "cart-item-demo-001",
          productId: "prod-003",
          name: "Estantería Industrial",
          price: 320000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
          category: "Estanterías",
        },
      ],
      subtotal: 320000,
      tax: 60800,
      total: 380800,
      createdAt: "2024-04-18T09:00:00Z",
      updatedAt: "2024-04-18T09:00:00Z",
    },
  ],
};

export const CARTS = cartsDb.carts;
