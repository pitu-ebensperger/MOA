export const usersDb = {
  metadata: {
    lastSyncAt: "2024-04-18T08:00:00Z",
    total: 3,
    adminCount: 1,
  },
  users: [
    {
      id: "usr-000",
      username: "mariana.rios",
      firstName: "Mariana",
      lastName: "Ríos",
      email: "admin@moa.cl",
      role: "ADMIN",
      status: "activo",
      phone: "+56 9 6543 2187",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=facearea",
      lastLoginAt: "2024-04-18T08:15:00Z",
      createdAt: "2021-05-10T14:12:00Z",
    },
    {
      id: "usr-001",
      username: "testcliente",
      firstName: "Camila",
      lastName: "López",
      email: "cliente@mail.com",
      role: "CLIENTE",
      status: "activo",
      phone: "+56 9 8765 4321",
      lastLoginAt: "2024-04-17T22:45:00Z",
      createdAt: "2023-08-12T16:25:00Z",
      addresses: [
        {
          address_id: "addr-001",
          label: "Casa",
          street: "Av. Italia 1024",
          commune: "Santiago",
          city: "Santiago",
          region: "RM",
          country: "Chile",
          postalcode: "7500000",
          isDefault: true,
        },
      ],
      stats: { orders: 8, lifetimeValue: 4_280_000 },
    },
    {
      id: "usr-demo",
      username: "demo",
      firstName: "Usuario",
      lastName: "Demo",
      email: "demo@moa.cl",
      role: "CLIENTE",
      status: "activo",
      phone: "+56 9 1234 5678",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=facearea",
      lastLoginAt: "2024-04-18T10:00:00Z",
      createdAt: "2024-01-01T00:00:00Z",
      addresses: [
        {
          address_id: "addr-demo",
          label: "Casa",
          street: "Av. Providencia 1234",
          commune: "Providencia",
          city: "Santiago",
          region: "RM",
          country: "Chile",
          postalcode: "7500000",
          isDefault: true,
        },
      ],
      stats: { orders: 3, lifetimeValue: 150_000 },
    },
  ],
};

export const USERS = usersDb.users;
export const ADMIN_USERS = usersDb.users.filter((user) => user.role === "admin");
export const CUSTOMER_USERS = usersDb.users.filter((user) => user.role !== "admin");
