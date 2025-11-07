import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Price } from "../../../components/data-display/Price.jsx";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop";

export default function ProductCard({
  product = {},
  onAddToCart = () => {},
  onToggleWishlist = () => {},
}) {
  const {
    id,
    slug,
    price = 50000,
    title,
    name,
    image,
    imageUrl,
    coverImage,
  } = product;

  const displayTitle = title ?? name ?? slug ?? "Nombre Producto";
  const displayImage = image ?? imageUrl ?? coverImage ?? FALLBACK_IMAGE;
  const productSlug = slug ?? (id ? String(id) : null);
  const href = productSlug ? `/products/${productSlug}` : "/products";

  return (
    <article
      className="
        group relative w-full max-w-[324px] h-[400px] mx-auto
        overflow-clip rounded-[10px] shadow-lg
        bg-(--color-white)]border border(--color-border-light)
        transition-all duration-300
        hover:scale-[1.01] hover:shadow-xl
        focus-within:scale-[1.01]
      "
    >
      {/* Imagen base */}
      <div className="absolute inset-0 size-full rounded-[10px] overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="
              absolute inset-0 size-full object-cover rounded-[10px]
              transition-transform duration-500 group-hover:scale-[1.03]
            "
          />
        ) : (
          <div className="absolute inset-0 bg-(--color-light)" />
        )}
      </div>

      <div
        className="
          pointer-events-none absolute left-0 right-0 bottom-0 h-[48%]
          bg-linear-to-t
          from-[rgba(72,51,19,0.55)] to-[rgba(170,123,50,0)]
          mix-blend-multiply
        "
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 bg-black/0 rounded-[10px] transition-opacity duration-300 group-hover:bg-black/10"
        aria-hidden
      />

      {/* Btn Agregar al carrito (aparece desde arriba al hover/focus) */}
      <div
        className=" btn-container flex justify-center w-fit
          absolute top-4 left-1/2 -translate-x-1/2 z-10
          opacity-0 -translate-y-6
          transition-all duration-300
          group-hover:opacity-100 group-hover:translate-y-0
          group-focus-within:opacity-100 group-focus-within:translate-y-0
        "
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // evita navegar si está envuelto por Link
            onAddToCart(product);
          }}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
            bg-white text(--color-dark)
            hover:bg-white/90 transition-colors
            shadow-lg
            focus:outline-none focus-visible:ring-[3px] focus-visible:ring-(--color-primary3)/30
          "
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Agregar al carrito</span>
        </button>
      </div>

      {/* Capa clickeable al detalle (centro de la tarjeta) */}
      <Link
        to={href}
        className="absolute inset-0"
        aria-label={`Ver detalle de ${displayTitle}`}
      />

      {/* Texto + wishlist (abajo) */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-6 flex items-end justify-between">
        {/* Nombre & precio */}
        <div className="flex flex-col gap-1">
          <h3
            className="
              title-sans font-semibold tracking-[-0.012em]
              text-white drop-shadow-sm
            "
          >
            {displayTitle}
          </h3>
          <Price value={price} className="text-white/90 block" />
        </div>

        {/* Corazón wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // no navegar al pulsar
            onToggleWishlist(product);
          }}
          className="
            shrink-0 p-2 rounded-full bg-white/20 backdrop-blur-sm
            hover:bg-white/30 transition-colors
            focus:outline-none focus-visible:ring-[3px] focus-visible:ring-white/50
          "
          aria-label="Agregar/Quitar de favoritos"
        >
          <Heart className="w-5 h-5 stroke-white" />
        </button>
      </div>
    </article>
  );
}

export { ProductCard };
