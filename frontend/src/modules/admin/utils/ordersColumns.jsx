import { formatDate_ddMMyyyy } from "../../../utils/date.js";
import { formatCurrencyCLP } from "../../../utils/currency.js";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";

export const buildOrderColumns = ({ onOpen }) => [
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
        {row.original.total != null
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
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    enableSorting: false,
    meta: { align: "right" },
    cell: ({ row }) => (
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border-subtle) hover:bg-(--surface-subtle)"
        onClick={() => onOpen?.(row.original)}
        aria-label="Ver detalle de orden"
      >
        <EyeIcon className="h-4 w-4 text-(--color-primary1)" />
      </button>
    ),
  },
];
