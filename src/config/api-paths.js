export const API_PATHS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    profile: "/auth/profile",
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
