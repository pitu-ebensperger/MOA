import { apiClient } from "@/services/api-client.js";

export const analyticsApi = {
  // Dashboard overview metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get("/admin/analytics/dashboard");
    return response.data;
  },

  // Sales analytics
  getSalesAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get(`/admin/analytics/sales`, {
      params: { period }
    });
    return response.data;
  },

  // Conversion metrics
  getConversionMetrics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/conversion", {
      params: { period }
    });
    return response.data;
  },

  // Top products analytics
  getTopProducts: async ({ limit = 10, period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/products/top", {
      params: { limit, period }
    });
    return response.data;
  },

  // Category analytics
  getCategoryAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/categories", {
      params: { period }
    });
    return response.data;
  },

  // Stock analytics
  getStockAnalytics: async () => {
    const response = await apiClient.get("/admin/analytics/stock");
    return response.data;
  },

  // Order distribution analytics
  getOrderDistribution: async ({ period = "week" } = {}) => {
    const response = await apiClient.get("/admin/analytics/orders/distribution", {
      params: { period }
    });
    return response.data;
  }
};