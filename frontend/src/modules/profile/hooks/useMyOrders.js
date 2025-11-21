import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/services/orders.api.js";
import { useAuth } from "@/context/auth-context.js";

export const useMyOrders = () => {
  const { token } = useAuth();

  const query = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.list(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  });

  return {
    orders: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
