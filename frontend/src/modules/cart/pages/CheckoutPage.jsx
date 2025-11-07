import { useCartContext } from "../components/../context/cartContext";
import { Trash2 } from "lucide-react";

export const CheckoutPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartContext();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePay = () => {
    if (cart.length === 0) return alert("Tu carrito está vacío 🛒");
    clearCart();
    alert("¡Gracias por tu compra! 🛍️");
  };

  return (
    <div className="min-h-screen bg-light px-8 py-10">
      <h1 className="text-3xl font-semibold text-primary1 mb-10">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Productos */}
        <div className="flex flex-wrap gap-6 flex-1">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-secondary2 rounded-2xl p-4 w-64 shadow-md flex flex-col justify-between"
              >
                <div className="h-36 bg-light rounded-xl flex items-center justify-center mb-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <span className="text-secondary1 text-sm">📦 Imagen</span>
                  )}
                </div>

                <div>
                  <h2 className="text-primary2 font-semibold">{item.name}</h2>
                  <p className="text-dark text-sm">{item.description}</p>
                  <p className="text-primary1 font-bold mt-2">
                    ${item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
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
            ))
          ) : (
            <p className="text-dark">Tu carrito está vacío 🛒</p>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-secondary2 rounded-2xl p-6 w-full md:w-80 shadow-md">
          <p className="text-dark text-sm mb-2">
            Resumen de compra — {cart.length} producto{cart.length !== 1 && "s"}
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
