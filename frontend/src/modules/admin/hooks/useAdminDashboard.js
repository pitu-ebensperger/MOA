import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { analyticsApi } from "@/services/analytics.api.js";
import { ordersApi } from "@/services/orders.api.js";

const DASHBOARD_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useAdminDashboard() {
  // Fetch multiple data sources in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: ["admin-dashboard-metrics"],
        queryFn: analyticsApi.getDashboardMetrics,
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-sales-analytics"],
        queryFn: () => analyticsApi.getSalesAnalytics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-conversion-metrics"],
        queryFn: () => analyticsApi.getConversionMetrics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-top-products"],
        queryFn: () => analyticsApi.getTopProducts({ limit: 5, period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-category-analytics"],
        queryFn: () => analyticsApi.getCategoryAnalytics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-stock-analytics"],
        queryFn: analyticsApi.getStockAnalytics,
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-order-distribution"],
        queryFn: () => analyticsApi.getOrderDistribution({ period: "week" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-recent-orders"],
        queryFn: () => ordersApi.list({ limit: 4, page: 1 }),
        staleTime: DASHBOARD_STALE_TIME * 0.5, // More frequent updates for recent orders
      },
    ],
  });

  const [
    dashboardMetricsQuery,
    salesAnalyticsQuery,
    conversionMetricsQuery,
    topProductsQuery,
    categoryAnalyticsQuery,
    stockAnalyticsQuery,
    orderDistributionQuery,
    recentOrdersQuery,
  ] = queries;

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.error);
  const errors = queries.map(query => query.error).filter(Boolean);

  // Process and normalize the data
  const dashboardData = useMemo(() => {
    if (isLoading) return null;

    const metrics = dashboardMetricsQuery.data || {};
    const salesData = salesAnalyticsQuery.data || {};
    const conversionData = conversionMetricsQuery.data || {};
    const topProducts = topProductsQuery.data || [];
    const categoryData = categoryAnalyticsQuery.data || [];
    const stockData = stockAnalyticsQuery.data || {};
    const orderDistribution = orderDistributionQuery.data || [];
    const recentOrders = recentOrdersQuery.data?.items || [];

    return {
      // Overview metrics
      metrics: {
        totalProducts: metrics.totalProducts || 0,
        totalOrders: metrics.totalOrders || 0,
        totalRevenue: metrics.totalRevenue || 0,
        totalCustomers: metrics.totalCustomers || 0,
        monthlyRevenue: salesData.currentMonth?.revenue || 0,
        previousMonthRevenue: salesData.previousMonth?.revenue || 0,
        growthPercentage: salesData.growthPercentage || 0,
      },

      // Stock analytics
      stock: {
        lowStockItems: stockData.lowStockCount || 0,
        outOfStockItems: stockData.outOfStockCount || 0,
        totalItems: stockData.totalItems || 0,
        lowStockProducts: stockData.lowStockProducts || [],
        outOfStockProducts: stockData.outOfStockProducts || [],
      },

      // Sales and conversion
      sales: {
        dailyRevenue: salesData.dailyRevenue || [],
        weeklyRevenue: salesData.weeklyRevenue || [],
        monthlyRevenue: salesData.monthlyRevenue || [],
        averageOrderValue: salesData.averageOrderValue || 0,
        totalTransactions: salesData.totalTransactions || 0,
      },

      conversion: {
        overallRate: conversionData.overallRate || 0,
        categoryRates: conversionData.categoryRates || [],
        monthlyTrend: conversionData.monthlyTrend || [],
        visitorCount: conversionData.visitorCount || 0,
        purchaserCount: conversionData.purchaserCount || 0,
      },

      // Top performing products
      topProducts: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sales: product.salesCount || 0,
        views: product.viewCount || 0,
        revenue: product.totalRevenue || 0,
        conversionRate: product.conversionRate || 0,
        image: product.images?.[0]?.url || product.imageUrl,
        price: product.price || 0,
      })),

      // Category performance
      categories: categoryData.map(category => ({
        id: category.id,
        name: category.name,
        sales: category.totalSales || 0,
        revenue: category.totalRevenue || 0,
        orders: category.orderCount || 0,
        conversionRate: category.conversionRate || 0,
      })),

      // Order distribution
      orderDistribution: orderDistribution.map(item => ({
        period: item.period,
        orders: item.orderCount || 0,
        percentage: item.percentage || 0,
        revenue: item.revenue || 0,
      })),

      // Recent orders
      recentOrders: recentOrders.slice(0, 4),

      // Order status distribution
      orderStatusCounts: metrics.orderStatusCounts || {},
    };
  }, [
    isLoading,
    dashboardMetricsQuery.data,
    salesAnalyticsQuery.data,
    conversionMetricsQuery.data,
    topProductsQuery.data,
    categoryAnalyticsQuery.data,
    stockAnalyticsQuery.data,
    orderDistributionQuery.data,
    recentOrdersQuery.data,
  ]);

  // Refetch all data
  const refetchAll = () => {
    queries.forEach(query => query.refetch());
  };

  return {
    data: dashboardData,
    isLoading,
    isError,
    errors,
    refetch: refetchAll,
  };
}