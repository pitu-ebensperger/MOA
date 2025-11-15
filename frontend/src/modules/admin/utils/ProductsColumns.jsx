//path/frontend/src/modules/admin/utils/productsColumns.jsx
import { AlertTriangle, Edit3, Eye, Trash2 } from "lucide-react";
import { formatCurrencyCLP } from "../../../utils/currency.js";
import { IconButton } from "../../../components/ui/Button.jsx";

const LOW_STOCK_THRESHOLD = 8;

const PUBLICATION_BADGES = {
  activo: { label: "Activo", classes: "bg-emerald-50 text-emerald-700" },
  borrador: { label: "Borrador", classes: "bg-amber-50 text-amber-700" },
  archivado: { label: "Archivado", classes: "bg-neutral-100 text-neutral-500" },
};

export function buildProductColumns({ onView, onEdit, onDelete, categoryMap }) {
  return [
    {
      id: "image",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-center px-1 py-2">
            <img
              src={product.imgUrl ?? product.gallery?.[0]}
              alt={product.name}
              className="h-12 w-12 rounded-2xl object-cover"
            />
          </div>
        );
      },
      size: 60,
    },
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-0.5 px-1 py-2">
            <span className="text-sm font-normal text-(--text-strong)">
              {product.name}
            </span>
            <span className="text-[11px] tracking-[0.15em] text-(--text-muted)">
              {product.sku}
            </span>
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const product = row.original;
        const label =
          (categoryMap && categoryMap[product.fk_category_id]) || "General";
        return (
          <span className="px-1 py-2 text-sm text-(--text-weak)">{label}</span>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original;
        const isLowStock =
          typeof product.stock === "number" &&
          product.stock <= LOW_STOCK_THRESHOLD;

        return (
          <div
            className={`flex items-center gap-1 px-1 py-2 text-sm font-semibold ${
              isLowStock ? "text-(--color-error)" : "text-(--text-strong)"
            }`}
          >
            {product.stock ?? "—"}
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-(--color-error)" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const product = row.original;
        const key = (product.status ?? "activo").toLowerCase();
        const badge = PUBLICATION_BADGES[key] ?? PUBLICATION_BADGES.activo;

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${badge.classes}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ getValue }) => {
        const price = getValue();
        return (
          <span className="px-1 py-2 text-sm text-(--text-strong)">
            {formatCurrencyCLP(price)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-2 px-1 py-2">
            <IconButton
              size="sm"
              intent="neutral"
              aria-label={`Ver ${product.name}`}
              icon={<Eye className="h-4 w-4" />}
              onClick={() => onView?.(product)}
            />
            <IconButton
              size="sm"
              intent="accent"
              aria-label={`Editar ${product.name}`}
              icon={<Edit3 className="h-4 w-4" />}
              onClick={() => onEdit?.(product)}
            />
            <IconButton
              size="sm"
              intent="danger"
              aria-label={`Eliminar ${product.name}`}
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDelete?.(product)}
            />
          </div>
        );
      },
    },
  ];
}
