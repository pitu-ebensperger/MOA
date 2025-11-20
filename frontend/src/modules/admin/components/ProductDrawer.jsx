import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/radix/Dialog.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select.jsx";
import { TooltipNeutral } from "@/components/ui/Tooltip.jsx";
import { ProductShape, CategoryShape } from "@/utils/propTypes.js";
import { Save, Trash2, X } from "lucide-react";

const STATUS_VALUES = ["activo", "sin_stock", "borrador"];

const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({
  value,
  label:
    value === "activo"
      ? "Activo"
      : value === "sin_stock"
        ? "Sin stock"
        : "Borrador",
}));

const DEFAULT_FORM_VALUES = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  status: "activo",
  fk_category_id: "",
  imgUrl: "",
  description: "",
  color: "",
  material: "",
  dimHeight: "",
  dimWidth: "",
  dimLength: "",
  dimUnit: "cm",
};

const productSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(2, "Nombre demasiado corto"),
  sku: z.string().min(2, "SKU requerido"),
  price: z.coerce.number().min(0, "Precio inválido"),
  stock: z.coerce.number().int().min(0, "Stock inválido"),
  status: z.enum(STATUS_VALUES),
  fk_category_id: z.union([z.string(), z.number()]).nullable().optional(),
  imgUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  dimHeight: z.string().optional(),
  dimWidth: z.string().optional(),
  dimLength: z.string().optional(),
  dimUnit: z.string().optional(),
});

const toNumOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const DIMENSION_UNIT_OPTIONS = [
  { value: "cm", label: "Centímetros (cm)" },
  { value: "mm", label: "Milímetros (mm)" },
  { value: "m", label: "Metros (m)" },
  { value: "in", label: "Pulgadas (in)" },
  { value: "ft", label: "Pies (ft)" },
];

const getDefaultValues = () => ({ ...DEFAULT_FORM_VALUES });

export function ProductDrawer({
  open,
  onClose,
  onSubmit,
  onDelete,
  initial,
  categories = [],
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;

    if (initial) {
      const dim = initial.dimensions || {};
      reset({
        ...initial,
        fk_category_id: initial.fk_category_id ?? "",
        dimHeight: dim.height ?? "",
        dimWidth: dim.width ?? "",
        dimLength: dim.length ?? "",
        dimUnit: dim.unit ?? "cm",
      });
    } else {
      reset(getDefaultValues());
    }
  }, [open, initial, reset]);

  const imgUrl = watch("imgUrl");

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Sin categoría" },
      ...(categories ?? []).map((category) => ({
        value: String(category.id ?? ""),
        label: category.name ?? "Sin categoría",
      })),
    ],
    [categories],
  );

  const handleFormSubmit = async (data) => {
    const {
      dimHeight,
      dimWidth,
      dimLength,
      dimUnit,
      fk_category_id,
      ...rest
    } = data;

    const height = toNumOrNull(dimHeight);
    const width = toNumOrNull(dimWidth);
    const length = toNumOrNull(dimLength);
    const unit = dimUnit || null;

    const dimensions =
      height !== null || width !== null || length !== null || unit
        ? { height, width, length, unit }
        : null;

    const payload = {
      ...rest,
      fk_category_id: fk_category_id || null,
      dimensions,
    };

    await onSubmit?.(payload);
  };

  const previewImage = imgUrl?.trim();

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent variant="drawer" placement="right" className="max-w-2xl rounded-tl-3xl rounded-bl-3xl">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col gap-5 p-6">
          <DialogHeader>
            <h2 className="text-lg font-semibold text-(--text-strong)">
              {initial ? "Editar producto" : "Nuevo producto"}
            </h2>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1 hide-scrollbar">
            {/* Información básica */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 space-y-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Información básica
              </h3>
              <Input
                label="Nombre"
                {...register("name")}
                error={errors.name?.message}
                fullWidth
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="SKU"
                  {...register("sku")}
                  error={errors.sku?.message}
                  fullWidth
                />
                <Select
                  label="Estado"
                  {...register("status")}
                  options={STATUS_OPTIONS}
                  fullWidth
                />
              </div>
            </div>

            {/* Inventario */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Inventario
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Input
                  label="Precio"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("price")}
                  error={errors.price?.message}
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  step="1"
                  {...register("stock")}
                  error={errors.stock?.message}
                />
              </div>
            </div>

            {/* Clasificación */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Clasificación
              </h3>
              <Select
                label="Categoría"
                {...register("fk_category_id")}
                options={categoryOptions}
                fullWidth
              />
            </div>

            {/* Imagen */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 space-y-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Imagen
              </h3>
              <Input
                label="Imagen (URL)"
                {...register("imgUrl")}
                placeholder="https://..."
                fullWidth
              />
              {previewImage && (
                <div className="rounded-2xl border border-neutral-200 bg-[color:var(--color-neutral1)] px-3 py-2">
                  <p className="text-xs font-semibold text-(--text-muted)">Previsualización</p>
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-2xl bg-(--surface-subtle)">
                    <img
                      src={previewImage}
                      alt="Previsualización del producto"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Características */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 space-y-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Características
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Color" {...register("color")} />
                <Input label="Material" {...register("material")} />
              </div>
              <Textarea
                label="Descripción"
                rows={4}
                {...register("description")}
                placeholder="Describe brevemente este producto"
                fullWidth
              />
            </div>

            {/* Dimensiones */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Dimensiones
              </h3>
              <div className="mt-2 grid grid-cols-4 gap-3">
                <Input
                  label="Alto"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="cm"
                  {...register("dimHeight")}
                />
                <Input
                  label="Ancho"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="cm"
                  {...register("dimWidth")}
                />
                <Input
                  label="Largo"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="cm"
                  {...register("dimLength")}
                />
                <Select
                  label="Unidad"
                  size="sm"
                  {...register("dimUnit")}
                  options={DIMENSION_UNIT_OPTIONS}
                  placeholder="Selecciona unidad"
                  fullWidth
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-2">
              {initial && (
                <TooltipNeutral label="Eliminar producto" position="top">
                  <Button
                    type="button"
                    appearance="ghost"
                    intent="error"
                    size="sm"
                    leadingIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => onDelete?.(initial)}
                  >
                    Eliminar producto
                  </Button>
                </TooltipNeutral>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TooltipNeutral label="Cerrar sin guardar" position="top">
                <Button
                  type="button"
                  appearance="soft"
                  intent="neutral"
                  size="sm"
                  leadingIcon={<X className="h-4 w-4" />}
                  onClick={onClose}
                  className="text-(--text-strong)"
                >
                  Cancelar
                </Button>
              </TooltipNeutral>
              <TooltipNeutral
                label={initial ? "Guardar cambios" : "Guardar producto"}
                position="top"
              >
                <Button
                  type="submit"
                  appearance="solid"
                  intent="primary"
                  size="sm"
                  leadingIcon={<Save className="h-4 w-4" />}
                  disabled={isSubmitting}
                  style={{
                    "--btn-gap": "0.35rem",
                    "--btn-icon-gap-left": "0.35rem",
                  }}
                >
                  {isSubmitting ? "Guardando..." : initial ? "Guardar cambios" : "Guardar producto"}
                </Button>
              </TooltipNeutral>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProductDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  initial: ProductShape,
  categories: PropTypes.arrayOf(CategoryShape),
};

export default ProductDrawer;
