export const API_PATH = {
  login: '/auth/login',
  register: '/usuarios',
  users: '/usuarios',
  products: '/productos',
  categories: '/categorias',
  cart: (usuario_id) => `/usuarios/${usuario_id}/carrito`,
  wishlist: (usuario_id) => `/usuarios/${usuario_id}/wishlist`,
  orders: '/orders',
};