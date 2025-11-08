import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { productsApi } from "../services/products.api.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop";

const initialState = {
  product: null,
  isLoading: true,
  error: null,
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [state, setState] = useState(initialState);
  const baseBreadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/products" },
  ];

  useEffect(() => {
    if (!id) {
      setState({ product: null, isLoading: false, error: new Error("Producto no encontrado") });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    productsApi
      .getById(id)
      .then((product) => {
        if (cancelled) return;
        setState({ product, isLoading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ product: null, isLoading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.isLoading) {
    return (
      <main className="page container-px mx-auto max-w-5xl py-10">
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </main>
    );
  }

  if (state.error || !state.product) {
    return (
      <main className="page container-px mx-auto max-w-5xl py-10">
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          No encontramos el producto que estás buscando.
        </div>
      </main>
    );
  }

  const product = state.product;
  const breadcrumbItems = product?.name
    ? [...baseBreadcrumbItems, { label: product.name }]
    : baseBreadcrumbItems;

  const heroImage = product.imgUrl ?? product.gallery?.[0] ?? FALLBACK_IMAGE;
  const collectionLabel =
    product.collection ??
    (product.fk_collection_id ? `Colección ${product.fk_collection_id}` : "Colección MOA");
  const descriptionPreview = product.shortDescription ?? product.description;
  const materialList =
    Array.isArray(product.materials) && product.materials.length
      ? product.materials
      : product.material
        ? [product.material]
        : [];

  return (
    <main className="page container-px mx-auto max-w-5xl py-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />
      <article className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <img
            src={heroImage}
            alt={product.name}
            className="aspect-4/5 w-full rounded-3xl object-cover"
          />
          <div className="grid grid-cols-4 gap-3">
            {(product.gallery ?? []).map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="aspect-square rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              {collectionLabel}
            </p>
            <h1 className="title-serif text-3xl sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-lg text-neutral-600">{descriptionPreview}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <Price value={product.price} className="text-2xl font-semibold text-neutral-900" />
            {product.compareAtPrice && (
              <Price value={product.compareAtPrice} className="text-sm text-neutral-400 line-through" />
            )}
          </div>

          {Array.isArray(product.variantOptions) && product.variantOptions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-neutral-700">Terminaciones</h2>
              <div className="flex flex-wrap gap-3">
                {product.variantOptions.map((variant) => (
                  <span
                    key={variant.id}
                    className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600"
                  >
                    <span
                      className="inline-flex size-4 rounded-full border border-neutral-300"
                      style={{ backgroundColor: variant.colorHex ?? "#d4d4d4" }}
                      aria-hidden
                    />
                    {variant.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {materialList.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-neutral-700">Materiales</h2>
              <p className="text-sm text-neutral-600">{materialList.join(" · ")}</p>
            </section>
          )}
        </div>
      </article>
    </main>
  );
};
