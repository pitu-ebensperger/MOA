import { formatDate_ddMMyyyy } from "../../../utils/date.js";
import { formatCurrencyCLP } from "../../../utils/currency.js";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../../../components/ui/radix/DropdownMenu.jsx";
import { MoreHorizontal, Eye, XCircle } from "lucide-react";

export const buildOrderColumns = ({ onOpen, onUpdateStatus, onCancel }) => [
  {
    accessorKey: "number",
    header: "Orden",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.number || "-"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.createdAt
          ? formatDate_ddMMyyyy(row.original.createdAt)
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    enableSorting: true,
    meta: { align: "right" },
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.original.total !== null && row.original.total !== undefined)
          ? formatCurrencyCLP(row.original.total)
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "items",
    header: "Ítems",
    enableSorting: false,
    meta: { align: "center" },
    cell: ({ row }) => {
      const count = Array.isArray(row.original.items)
        ? row.original.items.length
        : 0;
      return <span className="tabular-nums font-semibold">{count}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    enableSorting: true,
    cell: ({ row }) => {
      const order = row.original;
      const canUpdateStatus = order.status !== "cancelled" && order.status !== "fulfilled";

      if (!canUpdateStatus) {
        return <StatusPill status={order.status} />;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="cursor-pointer transition-opacity hover:opacity-80"
              aria-label="Cambiar estado de orden"
            >
              <StatusPill status={order.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "pending")}>
              Pendiente
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "processing")}>
              Procesando
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "shipped")}>
              Enviada
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "fulfilled")}>
              Completada
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onUpdateStatus?.(order, "cancelled")}
              className="text-red-600 focus:text-red-600"
            >
              Cancelada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    enableSorting: false,
    meta: { align: "right" },
    cell: ({ row }) => {
      const order = row.original;
      const canCancel = order.status !== "cancelled" && order.status !== "fulfilled";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border) hover:bg-(--surface-subtle) focus:outline-none focus:ring-2 focus:ring-(--color-primary1) focus:ring-offset-1"
              aria-label="Acciones de orden"
            >
              <MoreHorizontal className="h-4 w-4 text-(--color-text-muted)" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen?.(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalle
            </DropdownMenuItem>
            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onCancel?.(order)}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar orden
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
