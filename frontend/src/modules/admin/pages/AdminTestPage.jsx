import { useMemo, useState } from "react";
import { Eye, RefreshCw, Play } from "@icons/lucide";

import { Button, IconButton } from "@/components/ui/Button.jsx";
import { StatusPill } from "@/components/ui/StatusPill.jsx";
import { VirtualizedTable } from "@/components/data-display/VirtualizedTable.jsx";
import { OrdersTable } from "@/modules/admin/components/OrdersTable.jsx";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import AdminActionButton from "@/modules/admin/components/AdminActionButton.jsx";
import { formatCurrencyCLP } from "@/utils/currency.js";

const PAGE_SIZE = 5;

const MOCK_ORDERS = [
  { id: "ORD-1001", customer: "Camila Soto", total: 64990, status: "processing", payment: "captured", placedAt: "2024-05-12" },
  { id: "ORD-1002", customer: "Vicente Mardones", total: 38990, status: "fulfilled", payment: "captured", placedAt: "2024-05-11" },
  { id: "ORD-1003", customer: "Fernanda Plaza", total: 12990, status: "pending", payment: "pending", placedAt: "2024-05-10" },
  { id: "ORD-1004", customer: "Sofía Pino", total: 21990, status: "processing", payment: "pending", placedAt: "2024-05-08" },
  { id: "ORD-1005", customer: "Ignacio Reyes", total: 15990, status: "fulfilled", payment: "captured", placedAt: "2024-05-06" },
  { id: "ORD-1006", customer: "María José", total: 9290, status: "cancelled", payment: "refunded", placedAt: "2024-05-03" },
  { id: "ORD-1007", customer: "Diego Vega", total: 56990, status: "processing", payment: "captured", placedAt: "2024-05-01" },
  { id: "ORD-1008", customer: "Rocío Araya", total: 32990, status: "fulfilled", payment: "captured", placedAt: "2024-04-29" },
  { id: "ORD-1009", customer: "Tomás Fuentes", total: 44990, status: "pending", payment: "pending", placedAt: "2024-04-28" },
  { id: "ORD-1010", customer: "Valentina Díaz", total: 74990, status: "processing", payment: "captured", placedAt: "2024-04-26" },
];

export default function AdminTestPage() {
  const [page, setPage] = useState(1);

  const tableOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return MOCK_ORDERS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(MOCK_ORDERS.length / PAGE_SIZE)),
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Pedido",
        cell: ({ row }) => <span className="font-semibold text-(--text-strong)">#{row.original.id}</span>,
      },
      {
        accessorKey: "customer",
        header: "Cliente",
        cell: ({ row }) => <span className="text-(--text-strong)">{row.original.customer}</span>,
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <StatusPill status={row.original.status} domain="order" size="sm" />,
        meta: { align: "center" },
      },
      {
        accessorKey: "payment",
        header: "Pago",
        cell: ({ row }) => <StatusPill status={row.original.payment} domain="payment" size="sm" />,
        meta: { align: "center" },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-medium">{formatCurrencyCLP(row.original.total)}</span>,
        meta: { align: "right" },
      },
      {
        accessorKey: "placedAt",
        header: "Fecha",
        cell: ({ row }) =>
          new Date(row.original.placedAt).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        meta: { align: "center" },
      },
      {
        id: "action",
        header: "",
        cell: () => (
          <IconButton
            aria-label="Ver detalle"
            appearance="ghost"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
          />
        ),
        meta: { align: "right" },
      },
    ],
    []
  );

  const virtualizedColumns = useMemo(
    () => [
      { key: "id", header: "ID", width: "120px" },
      { key: "customer", header: "Cliente", width: "1fr" },
      { key: "status", header: "Estado", width: "140px" },
      { key: "total", header: "Total", width: "140px" },
      { key: "placedAt", header: "Fecha", width: "140px" },
    ],
    []
  );

  const virtualizedRows = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => ({
        id: `VIR-${1100 + index}`,
        customer: `Cliente ${index + 1}`,
        status: index % 5 === 0 ? "cancelled" : index % 2 === 0 ? "processing" : "fulfilled",
        total: 8990 + index * 120,
        placedAt: new Date(2024, 3, (index % 27) + 1).toISOString(),
      })),
    []
  );

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Playground Admin"
        subtitle="Proba componentes sin tocar los dashboards productivos. Usa datos mock locales."
        actions={
          <div className="flex items-center gap-2">
            <Button appearance="ghost" size="sm" onClick={() => setPage(1)} leadingIcon={<RefreshCw className="h-4 w-4" />}>
              Reset tabla
            </Button>
            <Button appearance="primary" intent="primary" size="sm" leadingIcon={<Play className="h-4 w-4" />}>
              Acción demo
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-(--text-secondary1)">Botones admin</p>
              <h3 className="text-lg font-semibold text-(--text-strong)">Acciones rápidas</h3>
            </div>
            <Button appearance="outline" size="sm" leadingIcon={<RefreshCw className="h-4 w-4" />}>
              Recargar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminActionButton>Botón primario</AdminActionButton>
            <Button size="sm" intent="primary">
              CTA Secundaria
            </Button>
            <IconButton size="sm" appearance="ghost" icon={<Eye className="h-4 w-4" />} aria-label="Ver" />
            <StatusPill status="processing" domain="order" size="sm" />
            <StatusPill status="pending" domain="payment" size="sm" />
            <StatusPill status="captured" domain="payment" size="sm" />
          </div>
        </div>

        <div className="rounded-3xl border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-(--text-secondary1)">Pills de estado</p>
              <h3 className="text-lg font-semibold text-(--text-strong)">Variantes rápidas</h3>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl bg-(--surface-subtle) px-4 py-3">
              <span className="text-sm text-(--text-secondary1)">Pedidos</span>
              <StatusPill status="fulfilled" domain="order" />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-(--surface-subtle) px-4 py-3">
              <span className="text-sm text-(--text-secondary1)">Pago</span>
              <StatusPill status="pending" domain="payment" />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-(--surface-subtle) px-4 py-3">
              <span className="text-sm text-(--text-secondary1)">Envío</span>
              <StatusPill status="in_transit" domain="shipment" />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-(--surface-subtle) px-4 py-3">
              <span className="text-sm text-(--text-secondary1)">Usuario</span>
              <StatusPill status="activo" domain="user" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-(--text-secondary1)">Tabla (TanStack)</p>
            <h3 className="text-lg font-semibold text-(--text-strong)">Pedidos mock con paginación</h3>
          </div>
          <Button size="sm" appearance="outline" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>
            Siguiente página
          </Button>
        </div>
        <OrdersTable
          data={tableOrders}
          columns={columns}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <div className="rounded-3xl border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-(--text-secondary1)">Tabla virtualizada</p>
          <h3 className="text-lg font-semibold text-(--text-strong)">120 filas renderizadas on-demand</h3>
          <p className="text-sm text-(--text-secondary1)">Útil para probar estilos/scroll de tablas largas sin hitting la API.</p>
        </div>
        <VirtualizedTable
          data={virtualizedRows}
          columns={virtualizedColumns}
          rowHeight={56}
          renderRow={(row) => (
            <div
              className="grid items-center px-4 py-2 text-sm text-(--text-strong)"
              style={{ gridTemplateColumns: virtualizedColumns.map((col) => col.width || "1fr").join(" ") }}
            >
              <span className="font-semibold">#{row.id}</span>
              <span className="truncate">{row.customer}</span>
              <StatusPill status={row.status} domain="order" size="sm" />
              <span className="text-right font-medium">{formatCurrencyCLP(row.total)}</span>
              <span className="text-center text-(--text-secondary1)">
                {new Date(row.placedAt).toLocaleDateString("es-CL")}
              </span>
            </div>
          )}
        />
      </div>
    </section>
  );
}
