import { useEffect, useState } from "react";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import fallbackImage from "../../../temp-hero.png";

const FALLBACK_IMAGE =
  fallbackImage ||
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop";

const formatPrice = (value) => {
  if (typeof value === "number") {
    return value.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    });
  }
  return value ?? "$0";
};

export default function ProductCardA({
  id = "1",
  productName = "Nombre Producto",
  price = "$50.000",
  imageUrl,
  showBadge = false,
  badgeText = "NUEVA TEMPORADA",
  onViewDetails,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isProductInWishlist,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [cartButtonPressed, setCartButtonPressed] = useState(false);
  const [detailsButtonPressed, setDetailsButtonPressed] = useState(false);
  const [localLiked, setLocalLiked] = useState(false);

  const coverImage = imageUrl || FALLBACK_IMAGE;
  const productPayload = {
    id,
    name: productName,
    price,
    image: coverImage,
  };

  const isLiked =
    typeof isProductInWishlist === "function"
      ? Boolean(isProductInWishlist(id))
      : localLiked;

  const handleLike = (event) => {
    event.stopPropagation();
    if (isLiked && typeof onRemoveFromWishlist === "function") {
      onRemoveFromWishlist(id);
    } else if (!isLiked && typeof onAddToWishlist === "function") {
      onAddToWishlist(productPayload);
    } else {
      setLocalLiked((prev) => !prev);
    }
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    if (typeof onAddToCart === "function") {
      onAddToCart(productPayload);
    }
    setCartButtonPressed(true);
  };

  const handleViewDetails = (event) => {
    event.stopPropagation();
    setDetailsButtonPressed(true);
    setTimeout(() => {
      onViewDetails?.(productPayload);
    }, 150);
  };

  useEffect(() => {
    if (!cartButtonPressed) return undefined;
    const timer = setTimeout(() => setCartButtonPressed(false), 300);
    return () => clearTimeout(timer);
  }, [cartButtonPressed]);

  useEffect(() => {
    if (!detailsButtonPressed) return undefined;
    const timer = setTimeout(() => setDetailsButtonPressed(false), 300);
    return () => clearTimeout(timer);
  }, [detailsButtonPressed]);

  return (
    <div
      className="relative h-[404px] w-[270px] overflow-hidden rounded-[8.889px] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        alt={productName}
        className="absolute inset-0 size-full rounded-[8.889px] object-cover object-center pointer-events-none"
        src={coverImage}
        loading="lazy"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[217px] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[115px] bg-gradient-to-b from-black/30 to-transparent" />

      {showBadge && (
        <div className="absolute top-[311px] left-[21px] z-10 flex h-[16.665px] w-[123px] items-center justify-center rounded-[15.768px] bg-[#d1ab84] px-[9.523px] py-[1.587px]">
          <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] text-[7.935px] font-bold leading-[11.13px] tracking-[1.5871px] text-white">
            {badgeText}
          </p>
        </div>
      )}

      <div
        className={`absolute inset-0 z-20 bg-[rgba(60,45,27,0.5)] mix-blend-multiply transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`absolute bottom-[21.89px] left-[20.89px] z-30 w-[228px] transition-opacity duration-300 ${
          isHovered ? "opacity-[0.43]" : "opacity-100"
        }`}
      >
        <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[17.778px] font-semibold leading-[1.5] text-white">
          {productName}
        </p>
        <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] text-[18px] font-normal text-[#d1ab84]">
          {formatPrice(price)}
        </p>
      </div>

      <button
        type="button"
        className="absolute right-[22.22px] top-[17px] z-30 size-[31px] cursor-pointer rounded-full bg-white/20 backdrop-blur-[5.5px] transition-colors duration-200 hover:bg-white/30"
        onClick={handleLike}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <div className="flex size-full items-center justify-center">
          <Heart
            className={`h-[18.97px] w-[18.97px] text-white transition-colors ${
              isLiked ? "fill-white" : "fill-transparent"
            }`}
            strokeWidth={1.8}
          />
        </div>
      </button>

      <div
        className={`absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-[10px] transition-all duration-300 ${
          isHovered ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex h-[36.088px] w-[145px] items-center justify-center gap-[8.817px] rounded-[6.766px] px-[22.042px] py-[10.58px] text-[14.107px] font-medium transition-all duration-300 ${
            cartButtonPressed ? "scale-95 bg-[#d1ab84]" : "bg-white text-[#9e7e67] hover:bg-neutral-50"
          }`}
        >
          <ShoppingCart
            size={16}
            className={`transition-colors ${cartButtonPressed ? "text-white" : "text-[#9e7e67]"}`}
          />
          <span className={cartButtonPressed ? "text-white" : "text-[#9e7e67]"}>Add to cart</span>
        </button>

        <button
          type="button"
          onClick={handleViewDetails}
          className={`flex h-[36.088px] w-[145px] items-center justify-center gap-[8.817px] rounded-[6.766px] border px-[22.042px] py-[10.58px] text-[14.107px] font-medium transition-all duration-300 ${
            detailsButtonPressed
              ? "scale-95 border-[#d1ab84] bg-[#d1ab84] text-white"
              : "border-white text-white hover:bg-white/10"
          }`}
        >
          <Eye size={16} className="text-current" />
          <span>Ver detalles</span>
        </button>
      </div>
    </div>
  );
}

export { ProductCardA };
