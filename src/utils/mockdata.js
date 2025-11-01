
export const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Producto ${i + 1}`,
  description: 'Neque porro quisquam est qui dolorem ipsum',
  price: 50000 + Math.floor(Math.random() * 100000),
  category: ['Categoría 1', 'Categoría 2', 'Categoría 3'][Math.floor(Math.random() * 3)],
  stock: Math.floor(Math.random() * 20) + 1,
  image: i % 3 === 0 ? 'https://images.unsplash.com/photo-1612927014450-29d80eeda8ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZnVybml0dXJlJTIwYmVpZ2V8ZW58MXx8fHwxNzYxOTE5MDY1fDA&ixlib=rb-4.1.0&q=80&w=400' : undefined,
}));

export const mockOrders = [
  { id: 1, date: '2025-10-25', status: 'Entregado', total: 150000, items: 3, customer: 'Juan Pérez' },
  { id: 2, date: '2025-10-20', status: 'En camino', total: 75000, items: 1, customer: 'María García' },
  { id: 3, date: '2025-10-15', status: 'Procesando', total: 200000, items: 4, customer: 'Carlos López' },
];

export const categories = [
  { id: 1, name: 'Categoría 1', slug: 'categoria-1' },
  { id: 2, name: 'Categoría 2', slug: 'categoria-2' },
  { id: 3, name: 'Categoría 3', slug: 'categoria-3' },
];
