import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js";

export function buildCategoryColumns({
  placeholderImage = DEFAULT_PLACEHOLDER_IMAGE,
} = {}) {
  return [
    {
      id: "cover",
      header: "",
      size: 72,
      meta: { align: "center" },
      cell: ({ row }) => {
        const category = row.original;
        const image = category.coverImage || placeholderImage;
        const initial = category.name?.[0]?.toUpperCase() ?? "C";
        return (
          <div className="flex items-center justify-center px-1 py-2">
            {image ? (
              <div className="h-12 w-12 overflow-hidden rounded-2xl bg-(--surface-subtle)">
                <img src={image} alt={category.name ?? "Categoría"} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-subtle)">
                <span className="text-sm font-semibold text-(--text-muted)">{initial}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ getValue }) => (
        <span className="px-1 py-2 text-sm font-medium text-(--text-strong)">{getValue()}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ getValue }) => (
        <span className="px-1 py-2 text-xs font-medium tracking-[0.2em] text-(--text-muted)">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ getValue }) => (
        <span className="px-1 py-2 text-sm text-(--text-secondary1) break-words">{getValue() || "—"}</span>
      ),
    },
  ];
}
