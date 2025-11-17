<<<<<<< Updated upstream
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, MapPin, CreditCard, MessageSquareHeart, ShoppingCart } from "lucide-react";
import { useCartContext } from "../../../context/cart-context.js";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../config/constants.js";
import { Price } from "../../../components/data-display/Price.jsx";
import { API_PATHS } from "../../../config/api-paths.js";
import { resolveProductPrice } from "../../products/utils/products.js";
import {
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "../../../components/shadcn/ui/index.js";

const buildItemImage = (item) =>
  item?.imgUrl ?? item?.image ?? item?.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;

const deliveryOptions = [
  { value: "standard", label: "Despacho estándar", detail: "48-72 h hábiles", cost: 0 },
  { value: "express", label: "Despacho express", detail: "24 h hábiles", cost: 6900 },
  { value: "pickup", label: "Retiro en showroom", detail: "Disponible hoy", cost: 0 },
];

const paymentOptions = [
  { value: "transfer", label: "Transferencia bancaria" },
  { value: "card", label: "Tarjeta crédito / débito" },
  { value: "link", label: "Link de pago" },
];
=======
import { Trash2 } from "lucide-react";
import { useCartContext } from "../../../context/cart-context.js";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../config/constants.js";
import { Price } from "../../../components/data-display/Price.jsx";
>>>>>>> Stashed changes

export const CheckoutPage = () => {
  const { cartItems, total, removeFromCart, clearCart } = useCartContext();
  const [deliveryMethod, setDeliveryMethod] = useState(deliveryOptions[0].value);
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0].value);
  const [notes, setNotes] = useState("");

  const hasItems = cartItems.length > 0;

  const deliveryInfo = useMemo(
    () => deliveryOptions.find((option) => option.value === deliveryMethod) ?? deliveryOptions[0],
    [deliveryMethod]
  );

  const shippingCost = hasItems ? deliveryInfo.cost : 0;
  const grandTotal = total + shippingCost;

  const handlePay = () => {
    if (!hasItems) {
      alert("Tu carrito está vacío 🛒");
      return;
    }
    clearCart();
    alert("¡Gracias por tu compra! 🛍️");
  };

  return (
    <main className="page container-px mx-auto max-w-6xl py-12">
      <header className="mb-10 space-y-3">
        <Badge variant="accent" className="bg-[var(--color-primary3)] text-[var(--color-text-on-dark)]">
          Paso final
        </Badge>
        <div>
          <h1 className="title-serif text-4xl text-[var(--color-primary1)]">Checkout MOA</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            Completa los datos del envío boutique o programa un retiro. Nos encargaremos de
            coordinar cada detalle para que tus piezas lleguen impecables.
          </p>
        </div>
      </header>

      {hasItems ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos del contacto</CardTitle>
                <CardDescription>Usaremos esta información para coordinar la entrega boutique.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>Nombre completo</Label>
                    <Input placeholder="Andrea Muñoz" autoComplete="name" />
                  </div>
<<<<<<< Updated upstream
                  <div className="space-y-2">
                    <Label required>Correo</Label>
                    <Input type="email" placeholder="andrea@estudio.cl" autoComplete="email" />
=======

                  <div>
                    <h2 className="text-primary2 font-semibold">{item.name}</h2>
                    <p className="text-dark text-sm">{item.description}</p>
                    <p className="text-primary1 font-bold mt-2">
                      <Price value={itemPrice} />
                    </p>
>>>>>>> Stashed changes
                  </div>
                  <div className="space-y-2">
                    <Label required>Teléfono</Label>
                    <Input type="tel" placeholder="+56 9 5555 5555" autoComplete="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de documento</Label>
                    <Input placeholder="12.345.678-9" autoComplete="off" />
                  </div>
                </div>
              </CardContent>
            </Card>

<<<<<<< Updated upstream
            <Card>
              <CardHeader>
                <CardTitle>Entrega y pago</CardTitle>
                <CardDescription>Selecciona la modalidad que prefieras; todo queda agendado en una sola visita.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label required>Dirección</Label>
                  <Input placeholder="Avenida Italia 1234" autoComplete="street-address" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>Ciudad</Label>
                    <Input placeholder="Providencia" autoComplete="address-level2" />
                  </div>
                  <div className="space-y-2">
                    <Label required>Método de entrega</Label>
                    <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} textValue={option.label}>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[var(--color-primary2)]">{option.label}</span>
                              <span className="text-xs text-[var(--color-text-muted)]">{option.detail}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>Método de pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas al equipo</Label>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Accesos al edificio, horarios preferidos…"
                      maxLength={280}
                    />
                    <p className="text-right text-xs text-[var(--color-text-muted)]">
                      {notes.length}/280 caracteres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>Resumen de piezas</CardTitle>
                  <CardDescription>
                    {cartItems.length} producto{cartItems.length === 1 ? "" : "s"} listos para envío
                  </CardDescription>
                </div>
                <Badge variant="neutral" className="text-[var(--color-primary2)]">
                  Curado
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const displayImage = buildItemImage(item);
                    const quantity = Number(item.quantity) || 1;
                    const itemPrice = resolveProductPrice(item) ?? 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/70 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#44311417]">
                            <img src={displayImage} alt={item.name ?? "Producto"} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-display text-sm text-[var(--color-primary2)]">{item.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Cantidad: {quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Price value={itemPrice * quantity} className="text-sm font-semibold text-[var(--color-primary1)]" />
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className={buttonClasses({
                              variant: "ghost",
                              size: "sm",
                              className: "gap-1 text-[0.6rem] uppercase tracking-[0.3em]",
                            })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                    <span>Subtotal</span>
                    <Price value={total} />
                  </div>
                  <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                    <span>Envío</span>
                    {shippingCost ? (
                      <Price value={shippingCost} />
                    ) : (
                      <Badge variant="accent" className="text-[0.6rem] tracking-[0.3em]">
                        Gratis
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold text-[var(--color-primary1)]">
                    <span>Total</span>
                    <Price value={grandTotal} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="w-full justify-center text-base"
                  onClick={handlePay}
                >
                  Confirmar y pagar
                </Button>
                <Link
                  to="/cart"
                  className={buttonClasses({
                    variant: "outline",
                    size: "md",
                    className: "w-full justify-center",
                  })}
                >
                  Volver al carrito
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-[var(--color-lightest)]">
              <CardHeader>
                <CardTitle>¿Necesitas coordinación especial?</CardTitle>
                <CardDescription>Estamos disponibles para alinear horarios o detalles con tu estudio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[var(--color-primary1)]" />
                  <span>Desembalaje y staging en la Región Metropolitana.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[var(--color-primary1)]" />
                  <span>Podemos enviar link de pago directo a tu cliente final.</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquareHeart className="h-5 w-5 text-[var(--color-primary1)]" />
                  <span>¿Dudas? Escríbenos por WhatsApp o coordina una videollamada.</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  to={API_PATHS.support.contact}
                  className={buttonClasses({
                    variant: "ghost",
                    size: "md",
                    className: "text-[var(--color-primary1)]",
                  })}
                >
                  Contactar al equipo
                </Link>
              </CardFooter>
            </Card>
          </aside>
=======
        {/* Resumen */}
        <div className="bg-secondary2 rounded-2xl p-6 w-full md:w-80 shadow-md">
          <p className="text-dark text-sm mb-2">
            Resumen de compra — {cartItems.length} producto{cartItems.length !== 1 && "s"}
          </p>
          <hr className="border-secondary1 mb-4" />
          <div className="flex justify-between items-center mb-6">
            <span className="text-primary2 font-medium">TOTAL</span>
            <span className="text-2xl font-bold text-primary1">
              <Price value={total} />
            </span>
          </div>
          <button
            onClick={handlePay}
            className="bg-primary1 text-light w-full py-3 rounded-lg hover:bg-primary2 transition"
          >
            Pagar
          </button>
>>>>>>> Stashed changes
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-6 border-dashed py-16 text-center">
          <div className="rounded-full bg-[var(--color-primary4)]/70 p-6 text-[var(--color-primary1)]">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--color-primary2)]">Aún no seleccionas piezas</h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
              Vuelve al catálogo y agrega productos para continuar con el checkout.
            </p>
          </div>
          <Link
            to={API_PATHS.products.products}
            className={buttonClasses({
              variant: "ghost",
              size: "md",
              className: "text-[var(--color-primary1)]",
            })}
          >
            Explorar colecciones
          </Link>
        </Card>
      )}
    </main>
  );
};
