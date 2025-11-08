export const API_PATHS = {
  auth: {
    login: "/login",
    register: "/register",
    profile: "/auth/profile",
    forgot: '/auth/forgot-password',
    reset: '/auth/reset-password',
  },
  catalog: {
    products: "/catalog/products",
    productDetail: (id) => `/catalog/products/${id}`,
    categories: "/catalog/categories",
    collections: "/catalog/collections",
  },
  cart: {
    root: (userId) => `/users/${userId}/cart`,
    checkout: (userId) => `/users/${userId}/checkout`,
  },
  orders: {
    root: "/orders",
    detail: (id) => `/orders/${id}`,
  },
  wishlist: {
    root: (userId) => `/users/${userId}/wishlist`,
  },
  home: {
    landing: "/content/home",
  },
};
