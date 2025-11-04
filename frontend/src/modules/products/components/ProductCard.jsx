import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { formatCurrencyCLP } from "../../../utils/currency.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop";

export default function ProductCard({
  product = {},
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) {
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

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product);
  };

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite?.(product, !isFavorite);
  };

  return (
    <article className="group relative h-fit w-full overflow-hidden rounded-2xl bg-white shadow-lg transition-transform duration-300 focus-within:-translate-y-1 hover-lift animate-fade-in-up">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={displayName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(36,27,13,0.55)] via-transparent to-transparent" />

        <Link
          to={href}
          className="absolute inset-0"
          aria-label={`Ver detalle de ${displayName}`}
        />

        <button
          type="button"
          onClick={handleAddToCart}
          className="pointer-events-none absolute left-1/2 top-5 z-10 flex -translate-x-1/2 -translate-y-2 items-center justify-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm font-medium text-gray-900 opacity-0 shadow-lg transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap"
        >
          <ShoppingCart className="size-4" />
          Agregar al carrito
        </button>

        <div className="absolute bottom-5 left-0 right-0 z-10 flex items-end justify-between px-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white drop-shadow-sm">
              {displayName}d
            </h3>
            <span className="text-sm text-white/90">{formattedPrice}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-pressed={isFavorite}
            className="inline-flex size-10 items-center justify-center rounded-full bg-white/25 text-white shadow transition-all duration-300 hover:bg-white/35"
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`size-5 ${
                isFavorite ? "fill-current var(--color-light)" : "stroke-current"
              }`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
