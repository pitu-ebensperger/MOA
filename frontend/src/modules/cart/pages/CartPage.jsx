import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartContext } from "../../../context/cartContext.jsx";
import Button from "../../../components/ui/Button.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../utils/constants.js";
import { resolveProductPrice } from "../../products/utils/products.js";
import { API_PATHS } from "../../../config/api-paths.js";

const buildItemImage = (item) =>
  item?.imgUrl ?? item?.image ?? item?.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;

const getItemKey = (item, index) =>
  item?.id ?? item?.slug ?? item?.name ?? `cart-item-${index}`;

export const CartPage = () => {
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } =
    useCartContext();
  const hasItems = cartItems.length > 0;

  return (
    <main className="page container-px mx-auto max-w-6xl py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500">
          Carro de compras
        </p>
        <h1 className="title-serif text-3xl font-semibold text-[var(--color-primary1)]">
          {hasItems ? "Tus piezas seleccionadas" : "Carrito vacío"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {hasItems
            ? `${cartItems.length} producto${cartItems.length === 1 ? "" : "s"} listo${cartItems.length === 1 ? "" : "s"} para revisar.`
            : "Explora la tienda y agrégales estilo a tus espacios."}
        </p>
      </header>

      {hasItems ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            {cartItems.map((item, index) => {
              const itemPrice = resolveProductPrice(item) ?? 0;
              const itemTotal = itemPrice * (Number(item.quantity) || 1);
              return (
                <article
                  key={getItemKey(item, index)}
                  className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-[#44311417]">
                      <img
                        src={buildItemImage(item)}
                        alt={item.name ?? "Producto"}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">{item.name}</h2>
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                        SKU {item.sku ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>Precio unidad</span>
                      <Price value={itemPrice} className="font-semibold text-neutral-900" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 rounded-full border border-neutral-300 px-2 py-1 text-sm font-medium text-neutral-600">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, (Number(item.quantity) || 1) - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:text-[var(--color-primary1)]"
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="mx-2 min-w-[26px] text-center">
                          {item.quantity ?? 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, (Number(item.quantity) || 1) + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:text-[var(--color-primary1)]"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400 transition hover:text-[var(--color-primary1)]"
                      >
                        <Trash2 className="mx-auto h-3 w-3" />
                        Eliminar
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>Total</span>
                      <Price value={itemTotal} className="font-semibold text-neutral-900" />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-[var(--color-lightest)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.1)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500">
                Resumen
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {cartItems.length} producto{cartItems.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center justify-between text-2xl font-semibold text-[var(--color-primary1)]">
              <span>Total</span>
              <Price value={total} />
            </div>
            <Button to="/checkout" variant="primary" size="md" fullWidth>
              Continuar al checkout
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500 transition hover:text-[var(--color-primary1)]"
            >
              Vaciar carrito
            </button>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-neutral-200 bg-white/80 p-10 text-center shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
          <ShoppingBag className="h-10 w-10 text-neutral-400" />
          <p className="text-lg font-semibold text-neutral-700">Tu carrito está vacío</p>
          <p className="text-sm text-neutral-500">
            Encuentra piezas únicas creadas para tus espacios y agrégalas cuando lo desees.
          </p>
          <Button to={API_PATHS.products.products} variant="ghost" size="md" className="text-sm font-semibold text-[var(--color-primary1)]">
            Seguir comprando
          </Button>
        </div>
      )}
    </main>
  );
};
