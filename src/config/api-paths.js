export const API_PATHS = {
  auth: {
    login: "/login",
    register: "/register",
    profile: "/auth/profile",
    forgot: '/auth/forgot-password',
    reset: '/auth/reset-password',
  },
  products: {
    products: "/products",
    productDetail: (id) => `/products/${id}`,
    categories: "/categories",
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

};
