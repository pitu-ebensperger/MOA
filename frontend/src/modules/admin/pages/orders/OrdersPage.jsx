import React from "react";
import { Plus, RefreshCw } from "lucide-react";

import { TanstackDataTable } from "../../../../components/data-display/DataTable.jsx";
import { Pagination } from "../../../../components/ui/Pagination.jsx";

import { useAdminOrders } from "../../hooks/useAdminOrders.js";
import { buildOrderColumns } from "../../utils/ordersColumns.jsx";
import OrdersDrawer from "../../components/OrdersDrawer.jsx";

export default function OrdersPage() {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const limit = 20;

  const { items, total, totalPages, isLoading, refetch } = useAdminOrders({
    page,
    limit,
    status,
    search,
  });

  const columns = React.useMemo(
    () =>
      buildOrderColumns({
        onOpen: (order) => setSelectedOrder(order),
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-(--text-strong)">
            Pedidos
          </h1>
          <p className="text-sm text-(--text-weak)">
            Revisa y administra las órdenes de la tienda MOA.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-secondary1) text-(--color-secondary1) hover:bg-(--surface-subtle)"
            aria-label="Refrescar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface-subtle) px-4 py-3">
        <div className="min-w-[200px] flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por número, cliente…"
            className="w-full rounded-full border border-(--border-subtle) bg-white px-3 py-1.5 text-sm"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-full border border-(--border-subtle) bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="fulfilled">Completada</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="admin-table-surface">
        <TanstackDataTable
          columns={columns}
          data={items}
          loading={isLoading}
          page={page}
          pageSize={limit}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* Paginación */}
      <div className="mt-3">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setPage}
        />
      </div>

      {/* Drawer detalle */}
      <OrdersDrawer
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
