import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import { formatCurrencyCLP } from "@/utils/currency.js"
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context.js";
import { useCartContext } from "@/context/cart-context.js";
import { API_PATHS } from "@/config/api-paths.js";

const Card = ({ data = {} }) => {
  const name = data.name ?? data.slug ?? "Producto MOA";
  const priceValue = Number(data.price ?? 0);
  const price = Number.isFinite(priceValue) ? priceValue : 0;
  const image = data.img ?? data.imgUrl ?? data.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartContext() ?? {};
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(API_PATHS.auth.login);
      return;
    }
    if (!addToCart) return;
    addToCart({
      id: data.id,
      name,
      price,
      imgUrl: image,
    });
  };

  return (
    <div className="relative bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-sm group">
      <div className="bg-[#44311417] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-70 object-cover"
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
        <h3 className="text-lg font-semibold mb-1 !text-white drop-shadow-md">{name}</h3>
        <p className="text-white font-medium text-base">{formatCurrencyCLP(price)}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleAddToCart}
          className="bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
          type="button"
        >
          Agregar al carro
        </button>
      </div>
    </div>
  );
};

export default Card;
