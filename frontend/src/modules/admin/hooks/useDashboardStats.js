import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

/**
 * Hook para obtener estadísticas generales del dashboard
 */
export function useDashboardStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'stats', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/stats?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener estadísticas por método de pago
 */
export function usePaymentMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'payment-methods', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/payment-methods?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener estadísticas por método de envío
 */
export function useShippingMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'shipping-methods', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/shipping-methods?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
