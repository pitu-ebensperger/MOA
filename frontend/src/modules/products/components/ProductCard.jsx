import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { formatCurrencyCLP } from "../../../utils/currency.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop";

const resolveBadgeLabel = (product) => {
  if (!product) return null;

  const candidateKeys = [
    "label",
    "etiqueta",
    "badge",
    "badgeText",
  ];

  for (const key of candidateKeys) {
    const value = product[key];
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
  }

  if (product.isNew) {
    return "Nueva temporada";
  }

  return null;
};

export default function ProductCard({
  product = {},
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
  isFavorite = false,
}) {
  const navigate = useNavigate();

  const {
    id,
    slug,
    title,
    name,
    price,
    image,
    imageUrl,
    images,
  } = product ?? {};

  const displayName = title ?? name ?? "Producto";

  const imageSrc = useMemo(() => {
    if (typeof image === "string" && image.length) return image;
    if (typeof imageUrl === "string" && imageUrl.length) return imageUrl;
    if (Array.isArray(images) && images.length) return images[0];
    return FALLBACK_IMAGE;
  }, [image, imageUrl, images]);

  const href = slug
    ? `/products/${slug}`
    : id !== undefined && id !== null
    ? `/products/${id}`
    : "/products";

  const formattedPrice = formatCurrencyCLP(price);
  const badgeLabel = resolveBadgeLabel(product);

  const [cartButtonPressed, setCartButtonPressed] = useState(false);
  const [detailsButtonPressed, setDetailsButtonPressed] = useState(false);

  useEffect(() => {
    if (!cartButtonPressed) return undefined;
    const timer = setTimeout(() => setCartButtonPressed(false), 220);
    return () => clearTimeout(timer);
  }, [cartButtonPressed]);

  useEffect(() => {
    if (!detailsButtonPressed) return undefined;
    const timer = setTimeout(() => setDetailsButtonPressed(false), 220);
    return () => clearTimeout(timer);
  }, [detailsButtonPressed]);

  const goToDetails = () => {
    onViewDetails?.(product);
    navigate(href);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCartButtonPressed(true);
    onAddToCart?.(product);
  };

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite?.(product, !isFavorite);
  };

  const handleViewDetails = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDetailsButtonPressed(true);
    goToDetails();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleCardKeyDown}
      className="group relative aspect-[4/5] w-full max-w-[270px] overflow-hidden rounded-2xl bg-neutral-900 shadow-xl transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 hover:-translate-y-1 hover:shadow-2xl"
    >
      <img
        src={imageSrc}
        alt={displayName}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      {badgeLabel && (
        <span className="absolute bottom-24 left-6 z-20 inline-flex items-center justify-center rounded-full bg-[#d1ab84] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          {badgeLabel}
        </span>
      )}

      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-pressed={isFavorite}
        className="absolute right-5 top-4 z-30 inline-flex size-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/35"
        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <Heart
          className={`size-5 transition-colors duration-200 ${
            isFavorite ? "fill-current text-white" : "stroke-current"
          }`}
        />
      </button>

      <div className="absolute bottom-6 left-0 right-0 z-20 flex items-end justify-between px-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">{displayName}</h3>
          <span className="text-sm font-medium text-[#d1ab84] drop-shadow">{formattedPrice}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex w-full max-w-[220px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex w-full items-center justify-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all duration-200 ${
            cartButtonPressed
              ? "scale-95 bg-[#d1ab84] text-white shadow-lg"
              : "bg-white text-[#9e7e67] shadow"
          } hover:bg-white/90`}
        >
          <ShoppingCart className="size-4" />
          Agregar al carrito
        </button>

        <button
          type="button"
          onClick={handleViewDetails}
          className={`flex w-full items-center justify-center gap-2 rounded-md border border-white/70 px-6 py-2 text-sm font-medium text-white transition-all duration-200 ${
            detailsButtonPressed ? "scale-95 bg-[#d1ab84] text-white" : "bg-white/10"
          } hover:bg-white/20`}
        >
          <Eye className="size-4" />
          Ver detalles
        </button>
      </div>
    </article>
  );
}
