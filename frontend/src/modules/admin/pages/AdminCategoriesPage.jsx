import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Trash2 } from "lucide-react";

import { categoriesApi } from "@/services/categories.api.js";
import { Button } from "@/components/ui/Button.jsx";
import { DataTableV2 } from "@/components/data-display/DataTableV2.jsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/radix/Dialog.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { buildCategoryColumns } from "@/modules/admin/utils/categoriesColumns.jsx";
import { useAdminCategories, ADMIN_CATEGORIES_QUERY_KEY } from "@/modules/admin/hooks/useAdminCategories.js";

const slugPattern = /^[a-z0-9-]+$/;

const sanitizeSlug = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

const initialFormState = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
};

const resolveErrorMessage = (error) =>
  error?.data?.message ?? error?.message ?? "Ocurrió un error inesperado";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { categories, isLoading, error } = useAdminCategories();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [formValues, setFormValues] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pageAlert, setPageAlert] = useState(null);

  const columns = useMemo(() => buildCategoryColumns(), []);

  const showAlert = useCallback((message, type = "success") => {
    setPageAlert({ message, type });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setActiveCategory(null);
    setFormValues(initialFormState);
    setFormError("");
    setFieldErrors({});
  }, []);

  const openCreateDrawer = useCallback(() => {
    handleCloseDrawer();
    setIsDrawerOpen(true);
    setPageAlert(null);
  }, [handleCloseDrawer]);

  const openEditDrawer = useCallback(
    (category) => {
      setActiveCategory(category);
      setFormValues({
        name: category.name ?? "",
        slug: category.slug ?? "",
        description: category.description ?? "",
        coverImage: category.coverImage ?? "",
      });
      setFieldErrors({});
      setFormError("");
      setIsDrawerOpen(true);
      setPageAlert(null);
    },
    [],
  );

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleSlugInput = useCallback(
    (event) => {
      const sanitized = sanitizeSlug(event.target.value);
      setFormValues((prev) => ({ ...prev, slug: sanitized }));
      setFieldErrors((prev) => ({ ...prev, slug: "" }));
    },
    [],
  );

  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries(ADMIN_CATEGORIES_QUERY_KEY);
  }, [queryClient]);

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => categoriesApi.create(payload),
    onSuccess: () => {
      invalidateCategories();
      showAlert("Categoría creada exitosamente");
      handleCloseDrawer();
    },
    onError: (mutationError) => {
      setFormError(resolveErrorMessage(mutationError));
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => categoriesApi.update(id, payload),
    onSuccess: () => {
      invalidateCategories();
      showAlert("Categoría actualizada exitosamente");
      handleCloseDrawer();
    },
    onError: (mutationError) => {
      setFormError(resolveErrorMessage(mutationError));
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      invalidateCategories();
      showAlert("Categoría eliminada exitosamente");
    },
    onError: (mutationError) => {
      showAlert(resolveErrorMessage(mutationError), "error");
    },
  });

  const isSaving = createCategoryMutation.isLoading || updateCategoryMutation.isLoading;

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");

    const payload = {
      nombre: formValues.name.trim(),
      slug: formValues.slug.trim(),
      descripcion: formValues.description.trim(),
      cover_image: formValues.coverImage.trim() || null,
    };

    const validationErrors = {};
    if (!payload.nombre) {
      validationErrors.name = "El nombre es obligatorio";
    }
    if (!payload.slug) {
      validationErrors.slug = "El slug es obligatorio";
    } else if (!slugPattern.test(payload.slug)) {
      validationErrors.slug =
        "El slug solo puede contener letras minúsculas, números y guiones";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (activeCategory) {
      updateCategoryMutation.mutate({ id: activeCategory.id, payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleDelete = useCallback(
    (category) => {
      if (
        !confirm(
          `¿Estás seguro de eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
        )
      ) {
        return;
      }
      deleteCategoryMutation.mutate(category.id);
    },
    [deleteCategoryMutation],
  );

  const rowActions = useMemo(
    () => [
      {
        label: "Editar",
        icon: Edit3,
        onAction: openEditDrawer,
      },
      {
        label: "Eliminar",
        icon: Trash2,
        onAction: handleDelete,
      },
    ],
    [handleDelete, openEditDrawer],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-(--text-strong)">Categorías</h1>
          <p className="text-sm text-(--text-secondary1)">
            Gestiona las categorías visibles en la tienda y mantén coherencia con los
            productos.
          </p>
        </div>
        <Button
          size="sm"
          appearance="solid"
          intent="primary"
          leadingIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateDrawer}
        >
          Crear Categoría
        </Button>
      </header>

      {pageAlert && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            pageAlert.type === "success"
              ? "border-[color:var(--color-success)] bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
              : "border-[color:var(--color-error)] bg-[color:var(--color-error)]/10 text-[color:var(--color-error)]"
          }`}
        >
          {pageAlert.message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[color:var(--color-error)] bg-[color:var(--color-error)]/10 px-4 py-3 text-sm text-[color:var(--color-error)]">
          No pudimos cargar las categorías. {resolveErrorMessage(error)}
        </div>
      )}

      <DataTableV2
        columns={columns}
        data={categories}
        loading={isLoading}
        emptyMessage="No hay categorías registradas"
        rowActions={rowActions}
        variant="card"
      />

      <Dialog open={isDrawerOpen} onOpenChange={(open) => !open && handleCloseDrawer()}>
        <DialogContent variant="drawer" placement="right" className="max-w-md rounded-tl-3xl rounded-bl-3xl">
          <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5 p-6">
            <DialogHeader>
              <h2 className="text-lg font-semibold text-(--text-strong)">
                {activeCategory ? "Editar categoría" : "Nueva categoría"}
              </h2>
              <p className="text-xs text-(--text-secondary1)">
                Mantén el slug único y en minúsculas con guiones para la URL.
              </p>
            </DialogHeader>

            <div className="flex-1 space-y-4">
              {formError && (
                <div className="rounded-2xl border border-[color:var(--color-error)] bg-[color:var(--color-error)]/10 px-4 py-2 text-xs font-medium text-[color:var(--color-error)]">
                  {formError}
                </div>
              )}

              <Input
                label="Nombre"
                value={formValues.name}
                onChange={handleInputChange("name")}
                placeholder="Ej. Decoración"
                error={fieldErrors.name}
                required
              />

              <Input
                label="Slug"
                value={formValues.slug}
                onChange={handleSlugInput}
                placeholder="decoracion"
                helperText="Solo letras minúsculas, números y guiones."
                error={fieldErrors.slug}
                required
              />

              <Textarea
                label="Descripción"
                value={formValues.description}
                onChange={handleInputChange("description")}
                placeholder="Escribe un texto breve que resuma la categoría"
              />

              <Input
                label="URL de imagen de portada"
                value={formValues.coverImage}
                onChange={handleInputChange("coverImage")}
                placeholder="https://..."
                type="url"
              />

              {formValues.coverImage && (
                <div className="rounded-2xl border border-neutral-200 bg-[color:var(--color-neutral1)] px-3 py-2">
                  <p className="text-xs font-semibold text-(--text-muted)">Previsualización</p>
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-2xl bg-(--surface-subtle)">
                    <img
                      src={formValues.coverImage}
                      alt="Previsualización de portada"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  appearance="ghost"
                  intent="neutral"
                  onClick={handleCloseDrawer}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  appearance="solid"
                  intent="primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : activeCategory ? "Actualizar categoría" : "Guardar categoría"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
