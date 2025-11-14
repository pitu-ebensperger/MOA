import { useMemo, useState } from "react";
import { CreditCard, Banknote, Truck, MapPin, ShoppingBag } from "lucide-react";
import { useCartContext } from "../context/cartContext.jsx";
import Button from "../../../components/ui/Button.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../utils/constants.js";
import { resolveProductPrice } from "../../products/utils/products.js";

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
  const { cartItems, total, clearCart } = useCartContext();
  const hasItems = cartItems.length > 0;
  const [formValues, setFormValues] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [notes, setNotes] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    PAYMENT_METHODS[0]?.id ?? null,
  );

  const shippingCost = hasItems ? 12000 : 0;
  const grandTotal = total + shippingCost;

  const requiredFields = ["fullName", "email", "address", "city", "region"];

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePay = () => {
    if (!hasItems) {
      alert("Tu carrito está vacío. Agrega productos antes de pagar.");
      return;
    }

    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!formValues[field]?.trim()) {
        nextErrors[field] = "Este campo es obligatorio.";
      }
    });

    if (!selectedPaymentMethod) {
      nextErrors.payment = "Selecciona un método de pago.";
    }

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    clearCart();
    alert(
      `¡Gracias por tu compra, ${formValues.fullName}! En breve recibirás confirmación en ${formValues.email}.`,
    );
    setFormValues(INITIAL_FORM_STATE);
    setNotes("");
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

  if (!hasItems) {
    return (
      <main className="page container-px mx-auto max-w-4xl py-12">
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-neutral-200 bg-white/90 p-10 text-center shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
          <ShoppingBag className="h-14 w-14 text-neutral-400" />
          <p className="text-lg font-semibold text-neutral-700">No tienes productos para pagar</p>
          <p className="text-sm text-neutral-500">
            Explora nuestro catálogo y agrega artículos para completar tu compra.
          </p>
          <Button to="/products" variant="primary" size="md">
            Seguir comprando
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="page container-px mx-auto max-w-7xl py-12">
      <header className="mb-10 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500">
          Checkout
        </p>
        <h1 className="title-serif text-3xl font-semibold text-[var(--color-primary1)]">
          Finaliza tu compra
        </h1>
        <p className="text-sm text-neutral-500">
          Completa tus datos de envío, selecciona el método de pago que prefieras y confirma la orden.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
              <Truck className="h-4 w-4 text-neutral-500" />
              Datos de envío
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { label: "Nombre completo", name: "fullName", type: "text", placeholder: "Ej. Lorenza Toledo" },
                { label: "Correo electrónico", name: "email", type: "email", placeholder: "hola@tucorreo.com" },
                { label: "Teléfono", name: "phone", type: "tel", placeholder: "+56 9 1234 5678" },
                { label: "Ciudad", name: "city", type: "text", placeholder: "Santiago" },
                { label: "Región / Provincia", name: "region", type: "text", placeholder: "Región Metropolitana" },
                { label: "Código postal", name: "postalCode", type: "text", placeholder: "8320000" },
                { label: "Dirección", name: "address", type: "text", placeholder: "Ej. Av. Los Leones 1234" },
              ].map((field) => {
                const error = formErrors[field.name];
                return (
                  <label key={field.name} className="flex flex-col gap-2 text-xs font-semibold text-neutral-600">
                    <span>{field.label}</span>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formValues[field.name]}
                      placeholder={field.placeholder}
                      onChange={handleInputChange}
                      className={[
                        "rounded-2xl border bg-[var(--color-lightest2)] px-4 py-3 text-sm transition focus:border-[var(--color-primary1)] focus:outline-none",
                        error ? "border-[var(--color-error)] text-neutral-900" : "border-transparent",
                      ].join(" ")}
                    />
                    {error && (
                      <span className="text-[var(--color-error)] text-[0.65rem] font-semibold uppercase tracking-[0.3em]">
                        {error}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
              <CreditCard className="h-4 w-4 text-neutral-500" />
              Método de pago
            </div>
            <div className="mt-6 space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isActive = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod(method.id);
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.payment;
                        return next;
                      });
                    }}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all",
                      isActive
                        ? "border-[var(--color-primary2)] bg-[var(--color-lightest)] shadow-[0_15px_30px_rgba(68,49,20,0.2)]"
                        : "border-neutral-200 bg-white hover:border-[var(--color-primary2)]",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 text-[var(--color-primary1)]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{method.label}</p>
                      <p className="text-xs text-neutral-500">{method.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {formErrors.payment && (
              <p className="mt-4 text-[var(--color-error)] text-[0.65rem] font-semibold uppercase tracking-[0.3em]">
                {formErrors.payment}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
              <MapPin className="h-4 w-4 text-neutral-500" />
              Observaciones
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Indica horarios de entrega, piso, referencias, etc."
              className="mt-4 h-32 w-full rounded-2xl border border-neutral-200 bg-[var(--color-lightest2)] px-4 py-3 text-sm focus:border-[var(--color-primary1)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.4em] text-neutral-500">
              <span>Resumen</span>
              <span className="text-[var(--color-primary1)]">{subtotalLabel}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-semibold text-[var(--color-primary1)]">
              <span>Total</span>
              <Price value={grandTotal} />
            </div>
            <Button
              fullWidth
              variant="primary"
              size="md"
              onClick={handlePay}
              disabled={!hasItems}
            >
              Confirmar y pagar
            </Button>
            <Button
              fullWidth
              variant="ghost"
              size="md"
              className="text-sm font-semibold text-[var(--color-primary1)]"
              onClick={() => clearCart()}
            >
              Vaciar carrito
            </Button>
          </div>
        </section>

        <aside className="space-y-6 rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
            <ShoppingBag className="h-4 w-4 text-neutral-500" />
            Tu orden
          </div>
          <div className="space-y-4">
            {hasItems ? (
              summaryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-transparent bg-neutral-100/80 p-3"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#44311417]">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between text-sm">
                    <div>
                      <p className="font-semibold text-neutral-900">{item.label}</p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity} × <Price value={item.price} className="text-neutral-500" />
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-neutral-900">
                      <Price value={item.total} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                Agrega productos al carrito para armar tu orden.
              </p>
            )}
          </div>
          <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex items-center justify-between text-neutral-500">
              <span>Subtotal</span>
              <Price value={total} className="font-semibold text-neutral-900" />
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <span>Despacho</span>
              <Price value={shippingCost} className="font-semibold text-neutral-900" />
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-[var(--color-primary1)]">
              <span>Total</span>
              <Price value={grandTotal} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
