import { Trash2, CreditCart, Banknote, MapPin } from "lucide-react";
import { useCartContext } from "../../../context/cartContext.jsx";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../utils/constants.js";
import { resolveProductPrice } from "../../products/utils/product.js";

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Tarjeta de crédito o débito",
    description: "Pagos seguros con VISA, Mastercard y AMEX.",
    icon: CreditCard,
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    description: "Recibirás los datos de la cuenta automáticamente.",
    icon: Banknote,
  },
  {
    id: "pickup",
    label: "Retiro en tienda",
    description: "Retira tu pedido en nuestro showroom en Santiago.",
    icon: MapPin,
  },
];

const buildItemImage = (item) =>
  item?.imgUrl ?? item?.image ?? item?.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;

const getItemKey = (item, index) =>
  item?.id ?? item?.slug ?? item?.name ?? `checkout-item-${index}`;

const INITIAL_FORM_STATE = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
};

export const CheckoutPage = () => {
  const { cartItems, total, removeFromCart, updateQuantity, clearCart } = useCartContext();
  const hasItems = cartItems.length > 0;

  const handlePay = () => {
    if (!hasItems) {
      alert("Tu carrito está vacío 🛒");
      return;
    }
    clearCart();
    alert("¡Gracias por tu compra! 🛍️");
  };

  const subtotalLabel = useMemo(
    () => (hasItems ? `${cartItems.length} producto${cartItems.length === 1 ? "" : "s"}` : "0 productos"),
    [cartItems.length, hasItems],
  );

  const summaryItems = useMemo(
    () =>
      cartItems.map((item) => {
        const price = resolveProductPrice(item) ?? 0;
        return {
          label: item.name ?? "Producto",
          quantity: item.quantity ?? 1,
          price,
          total: price * (Number(item.quantity) || 1),
          image: buildItemImage(item),
          id: getItemKey(item, item.id ?? 0),
        };
      }),
    [cartItems],
  );

  return (
    <div className="min-h-screen bg-light px-8 py-10">
      <h1 className="text-3xl font-semibold text-primary1 mb-10">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Productos */}
        <div className="flex flex-wrap gap-6 flex-1">
          {hasItems ? (
            cartItems.map((item) => {
              const displayImage = item.imgUrl ?? item.image ?? item.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;
              const itemPrice = Number(item.price ?? 0);
              return (
                <div
                  key={item.id}
                  className="bg-secondary2 rounded-2xl p-4 w-64 shadow-md flex flex-col justify-between"
                >
                  <div className="h-36 bg-[#44311417] rounded-xl flex items-center justify-center mb-4">
                    {displayImage ? (
                      <img src={displayImage} alt={item.name} className="w-24 h-24 object-contain" />
                    ) : (
                      <span className="text-secondary1 text-sm">📦 Imagen</span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-primary2 font-semibold">{item.name}</h2>
                    <p className="text-dark text-sm">{item.description}</p>
                    <p className="text-primary1 font-bold mt-2">
                      ${itemPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <select
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.id, parseInt(event.target.value, 10))
                      }
                      className="border border-secondary1 rounded-md px-2 py-1 bg-light"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5 text-primary2 hover:text-dark" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-dark">Tu carrito está vacío 🛒</p>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-secondary2 rounded-2xl p-6 w-full md:w-80 shadow-md">
          <p className="text-dark text-sm mb-2">
            Resumen de compra — {cartItems.length} producto{cartItems.length !== 1 && "s"}
          </p>
          <hr className="border-secondary1 mb-4" />
          <div className="flex justify-between items-center mb-6">
            <span className="text-primary2 font-medium">TOTAL</span>
            <span className="text-2xl font-bold text-primary1">
              ${total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handlePay}
            className="bg-primary1 text-light w-full py-3 rounded-lg hover:bg-primary2 transition"
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
};
