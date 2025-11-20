import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, MapPin, CreditCard, MessageSquareHeart, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/context/cart-context.js"
import { useAddresses } from "@/context/useAddresses.js"
import { usePaymentMethods } from "@/context/usePaymentMethods.js"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import { Price } from "@/components/data-display/Price.jsx"
import { API_PATHS } from "@/config/api-paths.js"
import { resolveProductPrice } from "@/modules/products/utils/products.js"
import { METODOS_DESPACHO } from "@/utils/orderTracking.js"
import ShippingMethodSelector from "@/modules/cart/components/ShippingMethodSelector.jsx"
import { createOrder } from "@/services/checkout.api.js"
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

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, total, removeFromCart, clearCart } = useCartContext();
  const { addresses, defaultAddress } = useAddresses();
  const { paymentMethods, defaultPaymentMethod, formatPaymentMethod } = usePaymentMethods();
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.direccion_id || null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(defaultPaymentMethod?.metodo_pago_id || null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Datos de contacto
  const [contactData, setContactData] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });

  // Dirección nueva (si no usa guardada)
  const [newAddress, setNewAddress] = useState({
    calle: '',
    comuna: '',
    ciudad: '',
    region: '',
  });

  const hasItems = cartItems.length > 0;

  const shippingInfo = useMemo(
    () => METODOS_DESPACHO[shippingMethod] ?? METODOS_DESPACHO.standard,
    [shippingMethod]
  );

  const shippingCost = hasItems ? shippingInfo.precio : 0;
  const grandTotal = total + shippingCost;

  const handleShippingChange = (method) => {
    setShippingMethod(method);
  };

  const handleContactChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (value) => {
    if (!value) {
      setSelectedPaymentId(null);
      return;
    }

    const numericId = Number(value);
    setSelectedPaymentId(Number.isNaN(numericId) ? null : numericId);
  };

  const handlePay = async () => {
    if (!hasItems) {
      alert("Tu carrito está vacío 🛒");
      return;
    }

    // Validaciones
    if (!contactData.nombre || !contactData.email || !contactData.telefono) {
      alert("Por favor completa todos los datos de contacto");
      return;
    }

    // Si no es retiro, validar dirección
    if (shippingMethod !== 'retiro') {
      if (!selectedAddressId && (!newAddress.calle || !newAddress.comuna || !newAddress.ciudad || !newAddress.region)) {
        alert("Por favor completa la dirección de envío");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const checkoutData = {
        metodo_despacho: shippingMethod,
        notas_cliente: notes,
        contacto: contactData,
      };

      // Si usa dirección guardada
      if (selectedAddressId && shippingMethod !== 'retiro') {
        checkoutData.usar_direccion_guardada = true;
        checkoutData.direccion_id = selectedAddressId;
      } 
      // Si es dirección nueva
      else if (shippingMethod !== 'retiro') {
        checkoutData.usar_direccion_guardada = false;
        checkoutData.direccion_nueva = newAddress;
      }

      // Agregar método de pago si está seleccionado
      if (selectedPaymentId) {
        checkoutData.metodo_pago_id = selectedPaymentId;
      }

      const response = await createOrder(checkoutData);

      if (response.success) {
        clearCart();
        alert(`¡Orden creada exitosamente! Código: ${response.data.order_code}`);
        navigate('/perfil'); // Redirigir a perfil donde verá sus órdenes
      } else {
        alert(response.message || 'Error al crear la orden');
      }

    } catch (error) {
      console.error('Error en checkout:', error);
      alert(error.response?.data?.message || 'Error al procesar la orden. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="page container-px mx-auto max-w-6xl py-12">
      <header className="mb-10 space-y-3">
        <Badge variant="accent" className="bg-(--color-primary3) text-[var(--color-text-on-dark)]">
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
                    <Input 
                      placeholder="Andrea Muñoz" 
                      autoComplete="name"
                      value={contactData.nombre}
                      onChange={(e) => handleContactChange('nombre', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Correo</Label>
                    <Input 
                      type="email" 
                      placeholder="andrea@estudio.cl" 
                      autoComplete="email"
                      value={contactData.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>Teléfono</Label>
                    <Input 
                      type="tel" 
                      placeholder="+56 9 5555 5555" 
                      autoComplete="tel"
                      value={contactData.telefono}
                      onChange={(e) => handleContactChange('telefono', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entrega y pago</CardTitle>
                <CardDescription>Selecciona la modalidad que prefieras; todo queda agendado en una sola visita.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Selector de método de despacho */}
                <ShippingMethodSelector
                  value={shippingMethod}
                  onChange={handleShippingChange}
                />

                {/* Solo mostrar dirección si no es retiro */}
                {shippingMethod !== 'retiro' && (
                  <>
                    {/* Selector de dirección guardada */}
                    {addresses.length > 0 && (
                      <div className="space-y-2">
                        <Label>Dirección guardada</Label>
                        <Select value={selectedAddressId?.toString()} onValueChange={(val) => setSelectedAddressId(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar dirección guardada" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map(addr => (
                              <SelectItem key={addr.direccion_id} value={addr.direccion_id.toString()}>
                                {addr.etiqueta || `${addr.calle}, ${addr.comuna}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* O nueva dirección */}
                    {!selectedAddressId && (
                      <>
                        <div className="space-y-2">
                          <Label required>Calle y número</Label>
                          <Input 
                            placeholder="Avenida Italia 1234" 
                            autoComplete="street-address"
                            value={newAddress.calle}
                            onChange={(e) => handleAddressChange('calle', e.target.value)}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label required>Comuna</Label>
                            <Input 
                              placeholder="Providencia" 
                              autoComplete="address-level3"
                              value={newAddress.comuna}
                              onChange={(e) => handleAddressChange('comuna', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label required>Ciudad</Label>
                            <Input 
                              placeholder="Santiago" 
                              autoComplete="address-level2"
                              value={newAddress.ciudad}
                              onChange={(e) => handleAddressChange('ciudad', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label required>Región</Label>
                            <Input 
                              placeholder="Metropolitana" 
                              value={newAddress.region}
                              onChange={(e) => handleAddressChange('region', e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>Método de pago</Label>
                    <Select value={selectedPaymentId?.toString()} onValueChange={handlePaymentChange} disabled={!paymentMethods.length}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => {
                          const methodId = method.metodo_pago_id ?? method.id;
                          if (!methodId) return null;
                          const label = formatPaymentMethod(method) || method.nombre || "Método de pago";
                          return (
                            <SelectItem key={methodId} value={methodId.toString()}>
                              {label}
                            </SelectItem>
                          );
                        })}
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
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar y pagar'}
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
            Explorar catálogo
          </Link>
        </Card>
      )}
    </main>
  );
};

CheckoutPage.propTypes = {};
