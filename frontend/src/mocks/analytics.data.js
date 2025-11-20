// Mock data for admin analytics
export const analyticsData = {
  dashboardMetrics: {
    totalProducts: 156,
    totalOrders: 342,
    totalRevenue: 8750000,
    totalCustomers: 89,
    orderStatusCounts: {
      pending: 8,
      confirmed: 12,
      processing: 6,
      shipped: 15,
      delivered: 298,
      cancelled: 3,
    }
  },

  salesAnalytics: {
    currentMonth: {
      revenue: 3200000,
      orders: 45,
      customers: 38
    },
    previousMonth: {
      revenue: 2450000,
      orders: 32,
      customers: 28
    },
    growthPercentage: 30.6,
    averageOrderValue: 71111,
    totalTransactions: 45,
    dailyRevenue: [
      { date: "2025-11-01", revenue: 150000 },
      { date: "2025-11-02", revenue: 230000 },
      { date: "2025-11-03", revenue: 180000 },
      { date: "2025-11-04", revenue: 320000 },
      { date: "2025-11-05", revenue: 280000 },
      { date: "2025-11-06", revenue: 190000 },
      { date: "2025-11-07", revenue: 250000 },
    ],
    weeklyRevenue: [
      { week: "W44", revenue: 1200000 },
      { week: "W45", revenue: 1450000 },
      { week: "W46", revenue: 1800000 },
      { week: "W47", revenue: 1650000 },
    ]
  },

  conversionMetrics: {
    overallRate: 2.4,
    visitorCount: 1875,
    purchaserCount: 45,
    categoryRates: [
      { categoryId: "1", name: "Living", conversionRate: 3.2 },
      { categoryId: "2", name: "Comedor", conversionRate: 2.8 },
      { categoryId: "3", name: "Dormitorio", conversionRate: 2.1 },
      { categoryId: "4", name: "Iluminación", conversionRate: 4.1 },
      { categoryId: "5", name: "Decoración", conversionRate: 1.9 },
    ],
    monthlyTrend: [
      { month: "Sep", rate: 2.1 },
      { month: "Oct", rate: 2.2 },
      { month: "Nov", rate: 2.4 },
    ]
  },

  topProducts: [
    {
      id: 1,
      name: "Sofá Modular Arena",
      sku: "MOA-LIV-SOFA-001",
      salesCount: 15,
      viewCount: 342,
      totalRevenue: 6899850,
      conversionRate: 4.4,
      price: 459990,
      imageUrl: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=400",
      images: [{ url: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=400" }]
    },
    {
      id: 2,
      name: "Mesa Roble Extensible",
      sku: "MOA-COM-MESA-045",
      salesCount: 12,
      viewCount: 289,
      totalRevenue: 3959880,
      conversionRate: 4.2,
      price: 329990,
      imageUrl: "https://images.unsplash.com/photo-1583845112239-97ef1341b271?q=80&w=400",
      images: [{ url: "https://images.unsplash.com/photo-1583845112239-97ef1341b271?q=80&w=400" }]
    },
    {
      id: 3,
      name: "Lámpara Industrial Cobre",
      sku: "MOA-ILU-LAMP-023",
      salesCount: 8,
      viewCount: 156,
      totalRevenue: 719920,
      conversionRate: 5.1,
      price: 89990,
      imageUrl: "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?q=80&w=400",
      images: [{ url: "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?q=80&w=400" }]
    },
    {
      id: 4,
      name: "Estantería Modular Nogal",
      sku: "MOA-EST-MOD-012",
      salesCount: 6,
      viewCount: 198,
      totalRevenue: 1079940,
      conversionRate: 3.0,
      price: 179990,
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400",
      images: [{ url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400" }]
    },
    {
      id: 5,
      name: "Sillón Escandinavo Verde",
      sku: "MOA-LIV-SILL-089",
      salesCount: 7,
      viewCount: 234,
      totalRevenue: 1609930,
      conversionRate: 3.0,
      price: 229990,
      imageUrl: "https://images.unsplash.com/photo-1586997451786-9cb28b41f531?q=80&w=400",
      images: [{ url: "https://images.unsplash.com/photo-1586997451786-9cb28b41f531?q=80&w=400" }]
    }
  ],

  categoryAnalytics: [
    {
      id: "1",
      name: "Living",
      totalSales: 28,
      totalRevenue: 8509720,
      orderCount: 15,
      conversionRate: 3.2
    },
    {
      id: "2",
      name: "Comedor",
      totalSales: 18,
      totalRevenue: 5939820,
      orderCount: 12,
      conversionRate: 2.8
    },
    {
      id: "3",
      name: "Dormitorio",
      totalSales: 11,
      totalRevenue: 3299890,
      orderCount: 8,
      conversionRate: 2.1
    },
    {
      id: "4",
      name: "Iluminación",
      totalSales: 15,
      totalRevenue: 1349850,
      orderCount: 7,
      conversionRate: 4.1
    },
    {
      id: "5",
      name: "Decoración",
      totalSales: 8,
      totalRevenue: 639920,
      orderCount: 4,
      conversionRate: 1.9
    }
  ],

  stockAnalytics: {
    lowStockCount: 8,
    outOfStockCount: 3,
    totalItems: 156,
    lowStockProducts: [
      {
        id: 23,
        name: "Mesa Centro Cristal",
        sku: "MOA-MES-CEN-023",
        currentStock: 2,
        minStock: 5,
        status: "low_stock"
      },
      {
        id: 45,
        name: "Lámpara Colgante Brass",
        sku: "MOA-LAM-COL-045", 
        currentStock: 1,
        minStock: 3,
        status: "low_stock"
      },
      // ... más productos con stock bajo
    ],
    outOfStockProducts: [
      {
        id: 67,
        name: "Sofá Esquinero Premium",
        sku: "MOA-SOF-ESQ-067",
        currentStock: 0,
        minStock: 2,
        status: "out_of_stock",
        lastSaleDate: "2025-11-15"
      },
      // ... más productos sin stock
    ]
  },

  orderDistribution: [
    {
      period: "Lunes",
      orderCount: 12,
      percentage: 15,
      revenue: 456000
    },
    {
      period: "Martes", 
      orderCount: 18,
      percentage: 22.5,
      revenue: 720000
    },
    {
      period: "Miércoles",
      orderCount: 15,
      percentage: 18.75,
      revenue: 600000
    },
    {
      period: "Jueves",
      orderCount: 14,
      percentage: 17.5,
      revenue: 560000
    },
    {
      period: "Viernes",
      orderCount: 21,
      percentage: 26.25,
      revenue: 864000
    }
  ]
};