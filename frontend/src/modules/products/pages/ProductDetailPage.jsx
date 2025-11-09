import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { productsApi } from "../services/products.api.js";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../utils/constants.js";
import { useCategories } from "../hooks/useCategories.js";
import {ChevronDown, Minus, Plus,Recycle, ShieldCheck,Sparkles,Truck,} from "lucide-react";

const initialState = {
  product: null,
  isLoading: true,
  error: null,
};

const formatDimensions = (dimensions) => {
  if (!dimensions) return null;
  const { width, length, height, unit = "cm" } = dimensions;
  const measures = [width, length, height].filter((value) => value !== undefined && value !== null);
  if (!measures.length) return null;
  if (measures.length === 3) {
    return `${width} × ${length} × ${height} ${unit}`;
  }
  return `${measures.join(" × ")} ${unit}`;
};

const formatWeight = (weight) => {
  if (!weight) return null;
  if (weight.value === undefined || weight.value === null) return null;
  return `${weight.value} ${weight.unit ?? "kg"}`;
};

const normalizeGallery = (product) => {
  const base = [
    product?.imgUrl ?? null,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ].filter(Boolean);
  if (!base.length) return [DEFAULT_PLACEHOLDER_IMAGE];
  return Array.from(new Set(base));
};

const ProductMediaGallery = ({ images, selectedImage, onSelectImage }) => {
  if (!images.length) return null;

  return (
    <section className="flex flex-col gap-6 lg:flex-row">


      <div className="order-1 flex-1 overflow-hidden rounded-[32px] bg-neutral-50">
        <img
          src={selectedImage}
          alt=""
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
    </section>
  );
};

const FeatureList = ({ items }) => {
  if (!items.length) return null;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-4">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700">
            {item.icon}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
            <p className="text-sm text-neutral-500">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AccordionSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-neutral-200">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-4 text-left text-neutral-900"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium">{title}</span>
        <ChevronDown
          className={[
            "size-4 text-neutral-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>
      {isOpen && <div className="pb-6 text-sm leading-relaxed text-neutral-600">{children}</div>}
    </section>
  );
};

const InfoGrid = ({ items }) => {
  if (!items.length) return null;
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-neutral-200 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-neutral-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { categories } = useCategories();
  const [state, setState] = useState(initialState);
  const [selectedImage, setSelectedImage] = useState(DEFAULT_PLACEHOLDER_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [activeVariant, setActiveVariant] = useState(null);

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

  const product = state.product;
<<<<<<< Updated upstream
   const categoryBreadcrumb = useMemo(() => {
    if (!product) return null;
    const candidateId =
      product.fk_category_id ?? product.categoryId ?? product.category?.id ?? null;
    const match =
      candidateId !== null
        ? categories.find((category) => String(category.id) === String(candidateId))
        : null;
    if (match) {
      const param = match.slug ?? match.id ?? candidateId;
      const href = param ? `/products?category=${encodeURIComponent(param)}` : "/products";
      return {
        label: match.name ?? "Categoría",
        href,
      };
    }
    if (product.collection) {
      return {
        label: product.collection,
        href: "/products",
      };
    }
    return null;
  }, [product, categories]);

=======
>>>>>>> Stashed changes
  const galleryImages = useMemo(() => normalizeGallery(product), [product]);

  useEffect(() => {
    if (!galleryImages.length) return;
    setSelectedImage(galleryImages[0]);
  }, [galleryImages]);

  const variantOptions = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variantOptions) && product.variantOptions.length) {
      return product.variantOptions.map((variant, index) => ({
        id: variant.id ?? index,
        label: variant.name ?? `Opción ${index + 1}`,
        colorHex: variant.colorHex,
      }));
    }
    if (product.color) {
      return [
        {
          id: product.color,
          label: product.color,
          colorHex: product.variantOptions?.[0]?.colorHex,
        },
      ];
    }
    return [];
  }, [product]);

  useEffect(() => {
    if (!variantOptions.length) {
      setActiveVariant(null);
      return;
    }
    setActiveVariant((prev) => {
      if (prev !== null && variantOptions.some((variant) => variant.id === prev)) {
        return prev;
      }
      return variantOptions[0].id;
    });
  }, [variantOptions]);

  const collectionLabel = product?.collection ?? "Colección MOA";
  const descriptionPreview = product?.shortDescription || product?.description;
  const materialList = useMemo(() => {
    if (!product) return [];
    const materials = Array.isArray(product.materials) ? product.materials : [];
    if (materials.length) return materials.filter(Boolean);
    if (product.material) return [product.material];
    return [];
  }, [product]);

  const specEntries = useMemo(() => {
    if (!product) return [];
    const specs = product.specs;
    if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
    return Object.entries(specs);
  }, [product]);

  const infoItems = useMemo(() => {
    if (!product) return [];
    return [
      product.sku ? { label: "SKU", value: product.sku } : null,
      { label: "Colección", value: collectionLabel },
      product.stock !== undefined && product.stock !== null
        ? {
            label: "Disponibilidad",
            value: product.stock > 0 ? `${product.stock} unidades en stock` : "Producción a pedido",
          }
        : null,
      materialList.length ? { label: "Materiales", value: materialList.join(" · ") } : null,
      product.dimensions ? { label: "Dimensiones", value: formatDimensions(product.dimensions) } : null,
      product.weight ? { label: "Peso", value: formatWeight(product.weight) } : null,
    ].filter(Boolean);
  }, [product, collectionLabel, materialList]);

  const highlights = [
    {
      icon: <Truck className="size-4" aria-hidden />,
      label: "Despacho rápido",
      description: "48-72 h dentro de la RM. Regiones vía transporte asociado.",
    },
    {
      icon: <ShieldCheck className="size-4" aria-hidden />,
      label: "Garantía MOA",
      description: "18 meses contra defectos de fabricación.",
    },
    {
      icon: <Recycle className="size-4" aria-hidden />,
      label: "Materiales responsables",
      description: materialList.length ? materialList.join(" · ") : "Selección sustentable certificada.",
    },
  ];

  const sections = [
    {
      title: "Descripción",
      content: product?.description ?? "Producto MOA diseñado para acompañar tus espacios.",
    },
    {
      title: "Materiales y cuidado",
      content:
        materialList.length > 0
          ? `Fabricado en ${materialList.join(
              ", ",
            )}. Limpiar con paño seco y evitar exposición directa y prolongada al sol o humedad.`
          : "Recomendamos limpieza suave con paño seco y proteger de la luz solar directa.",
    },
    {
      title: "Medidas y especificaciones",
      content: (
        <ul className="space-y-2">
          {product?.dimensions && (
            <li>
              <span className="font-medium text-neutral-800">Dimensiones:&nbsp;</span>
              <span>{formatDimensions(product.dimensions)}</span>
            </li>
          )}
          {product?.weight && (
            <li>
              <span className="font-medium text-neutral-800">Peso:&nbsp;</span>
              <span>{formatWeight(product.weight)}</span>
            </li>
          )}
          {specEntries.map(([key, value]) => (
              <li key={key}>
                <span className="font-medium text-neutral-800">{key}:&nbsp;</span>
                <span>{value}</span>
              </li>
            ))}
          {!product?.dimensions && !product?.weight && specEntries.length === 0 && (
            <li>Consultar ficha técnica para más detalles.</li>
          )}
        </ul>
      ),
    },
    {
      title: "Despachos y devoluciones",
      content:
        "Despachamos a todo Chile a través de partners logísticos. Puedes solicitar devolución dentro de los 10 días siguientes a la entrega si el producto no fue usado y mantiene su empaque original.",
    },
  ];

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(99, prev + 1));
  };

  if (state.isLoading) {
    return (
      <main className="page container-px mx-auto max-w-6xl py-12">
<<<<<<< Updated upstream
=======
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
>>>>>>> Stashed changes
        <div className="h-[30rem] animate-pulse rounded-[32px] bg-neutral-100" />
      </main>
    );
  }

  if (state.error || !product) {
    return (
      <main className="page container-px mx-auto max-w-6xl py-12">
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
        
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          No encontramos el producto que estás buscando.
        </div>
      </main>
    );
  }

<<<<<<< Updated upstream
  const breadcrumbItems = categoryBreadcrumb
    ? [...baseBreadcrumbItems, categoryBreadcrumb]
      : baseBreadcrumbItems;


  return (
    <main className="page container-px mx-auto max-w-6xl py-12 lg:py-16">

=======
  const breadcrumbItems = product?.name
    ? [...baseBreadcrumbItems, { label: product.name }]
    : baseBreadcrumbItems;

  return (
    <main className="page container-px mx-auto max-w-6xl py-12 lg:py-16">
   
>>>>>>> Stashed changes
      <article className="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <ProductMediaGallery
          images={galleryImages}
          selectedImage={selectedImage}
<<<<<<< Updated upstream
          onSelectImage={setSelectedImage} />

        <section className="space-y-8">
          <div className="space-y-3">

            <Breadcrumbs items={breadcrumbItems} className="mt-5 mb-6 lg:mb-5 text-sm font-light" />
            <h1 className="title-serif text-3xl text-(--color-primary1) sm:text-4xl">{product.name}</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-(--color-secondary1)">{product.sku}</p>

          </div>

          <div className="flex flex-wrap items-center gap-4 border-y border-neutral-200 py-4">
            <Price value={product.price} className="text-4xl text-(--font-display) text-neutral-900" />
            {product.compareAtPrice && (
              <Price
                value={product.compareAtPrice}
                className="text-base text-neutral-400 line-through" />)}


          </div>



        </section>
      

        <section className="space-y-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex w-full items-center justify-between rounded-full border border-neutral-200 px-4 py-2 text-lg sm:w-40">
              <button
                type="button"
                onClick={handleDecrease}
                className="rounded-full p-1.5 text-neutral-500 transition hover:text-neutral-900"
                aria-label="Disminuir cantidad"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="font-semibold text-neutral-900">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                className="rounded-full p-1.5 text-neutral-500 transition hover:text-neutral-900"
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-neutral-900 px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-800"
            >
              Agregar al carrito
            </button>
          </div>
        </section>

        <FeatureList items={highlights} />
    </article>
    <section className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.35fr)]">
=======
          onSelectImage={setSelectedImage}
        />

        <section className="space-y-8">
          <div className="space-y-3">
            <Breadcrumbs items={breadcrumbItems} className="mb-6 lg:mb-5 text-xs font-light" />
            <h1 className="title-serif text-3xl text-(--color-primary1) sm:text-4xl">{product.name}</h1>
            <p className="text-xs uppercase tracking-[0.45em] text-(--color-secondary1)">{product.sku}</p>
           
          </div>

          <div className="flex flex-wrap items-center gap-4 border-y border-neutral-200 py-4">
            <Price value={product.price} className="text-4xl font-semibold text-neutral-900" />
            {product.compareAtPrice && (
              <Price
                value={product.compareAtPrice}
                className="text-base text-neutral-400 line-through"
              />
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-900">
              <Sparkles className="size-3.5" aria-hidden />
              {product.stock > 0 ? "Disponible" : "A pedido"}
            </span>
          </div>

          {variantOptions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-neutral-800">Terminaciones</h2>
              <div className="flex flex-wrap gap-2">
                {variantOptions.map((variant) => {
                  const isActive = activeVariant === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setActiveVariant(variant.id)}
                      className={[
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                        isActive
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                      ].join(" ")}
                    >
                      {variant.colorHex && (
                        <span
                          className="inline-flex size-3 rounded-full border border-white/40"
                          style={{ backgroundColor: variant.colorHex }}
                          aria-hidden
                        />
                      )}
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-800">Cantidad</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex w-full items-center justify-between rounded-full border border-neutral-200 px-4 py-2 text-lg sm:w-40">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="rounded-full p-1.5 text-neutral-500 transition hover:text-neutral-900"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <span className="font-semibold text-neutral-900">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="rounded-full p-1.5 text-neutral-500 transition hover:text-neutral-900"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>

              <button
                type="button"
                className="w-full rounded-full bg-neutral-900 px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-800"
              >
                Agregar al carrito
              </button>
            </div>
            <p className="text-xs text-neutral-500">Envíos coordinados una vez confirmada la compra.</p>
          </section>

          <FeatureList items={highlights} />
        </section>
      </article>

      <section className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.35fr)]">
>>>>>>> Stashed changes
        <div className="space-y-2">
          {sections.map((section, index) => (
            <AccordionSection key={section.title} title={section.title} defaultOpen={index === 0}>
              {section.content}
            </AccordionSection>
          ))}
        </div>
        <div className="space-y-4">
          <InfoGrid items={infoItems} />
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div>
<<<<<<< Updated upstream

=======
             
>>>>>>> Stashed changes
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
