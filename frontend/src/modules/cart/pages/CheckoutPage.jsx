import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, MapPin, CreditCard, MessageSquareHeart, ShoppingCart, Banknote, Wallet, Smartphone, CircleDollarSign, CheckCircle2, Package, Truck, Receipt, Store, Home } from "lucide-react";
import { useCartContext } from "@/context/cart-context.js"
import { useAuth } from "@/context/auth-context.js"
import { useAddresses } from "@/context/useAddresses.js"
import { useStoreConfig } from "@/hooks/useStoreConfig.js"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/radix/Dialog.jsx"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import { Price } from "@/components/data-display/Price.jsx"
import { API_PATHS } from "@/config/api-paths.js"
import { resolveProductPrice } from "@/modules/products/utils/products.js"
import { METODOS_DESPACHO } from "@/utils/orderTracking.js"
import ShippingMethodSelector from "@/modules/cart/components/ShippingMethodSelector.jsx"
import { createOrder } from "@/services/checkout.api.js"
import { CHILE_REGIONES } from "@/config/chile-regiones.js"
import '@/styles/alerts.css'
import { alertInfo, alertWarning, alertOrderError, alertOrderSuccess, alertGlobalError } from '@/utils/alerts.js'
import { useErrorHandler, useFormErrorHandler } from '@/hooks/useErrorHandler.js';
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

const DEBUG_LOGS = import.meta.env?.VITE_DEBUG_LOGS === 'true';
const debugError = (...args) => {
  if (DEBUG_LOGS) {
    console.error(...args);
  }
};

const buildItemImage = (item) =>
  item?.imgUrl ?? item?.image ?? item?.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;
const cartItemShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string,
  quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  imgUrl: PropTypes.string,
  image: PropTypes.string,
  gallery: PropTypes.arrayOf(PropTypes.string),
  price: PropTypes.number,
  precio: PropTypes.number,
});

const addressShape = PropTypes.shape({
  direccion_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  etiqueta: PropTypes.string,
  calle: PropTypes.string,
  comuna: PropTypes.string,
  ciudad: PropTypes.string,
  region: PropTypes.oneOf(CHILE_REGIONES),
});

const userShape = PropTypes.shape({
  nombre: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  telefono: PropTypes.string,
  phone: PropTypes.string,
});

const configShape = PropTypes.shape({
  email: PropTypes.string,
  telefono: PropTypes.string,
});

export const CheckoutPage = ({
  cartItems: controlledCartItems,
  total: controlledTotal,
  user: controlledUser,
  addresses: controlledAddresses,
  defaultAddress: controlledDefaultAddress,
  config: controlledConfig,
} = {}) => {
  const navigate = useNavigate();
  const cartContext = useCartContext();
  const authContext = useAuth();
  const addressesContext = useAddresses();
  const storeConfig = useStoreConfig();

  const cartItems = controlledCartItems ?? cartContext?.cartItems ?? [];
  const total = typeof controlledTotal === 'number' ? controlledTotal : cartContext?.total ?? 0;
  const removeFromCart = cartContext?.removeFromCart ?? (() => {});
  const clearCart = cartContext?.clearCart ?? (() => {});
  const user = controlledUser ?? authContext?.user ?? null;
  const addresses = controlledAddresses ?? addressesContext?.addresses ?? [];
  const defaultAddress = controlledDefaultAddress ?? addressesContext?.defaultAddress ?? null;
  const config = controlledConfig ?? storeConfig?.config ?? {};
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.direccion_id || null);
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderPreview, setOrderPreview] = useState(null);
  const { handleError } = useErrorHandler({
    showAlert: false,
    defaultMessage: 'No pudimos procesar tu orden. Intenta nuevamente.',
  });
  const {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFormErrorHandler();
  
  // Datos de contacto (prellenados con info del usuario)
  const [contactData, setContactData] = useState({
    nombre: user?.nombre || user?.name || '',
    email: user?.email || '',
    telefono: user?.telefono || user?.phone || '',
  });

  // Dirección nueva (si no usa guardada)
  const [newAddress, setNewAddress] = useState({
    calle: '',
    comuna: '',
    ciudad: '',
    region: '',
  });
  const clearAddressFieldErrors = useCallback(() => {
    ['calle', 'comuna', 'ciudad', 'region'].forEach((field) => clearFieldError(field));
  }, [clearFieldError]);

  const hasItems = cartItems.length > 0;
  useEffect(() => {
    if (shippingMethod === 'retiro') {
      clearAddressFieldErrors();
    }
  }, [shippingMethod, clearAddressFieldErrors]);

  useEffect(() => {
    if (selectedAddressId) {
      clearAddressFieldErrors();
    }
  }, [selectedAddressId, clearAddressFieldErrors]);

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
    clearFieldError(field);
  };

  const handleAddressChange = (field, value) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handlePay = () => {
    if (!hasItems) {
      alertInfo('Agrega productos antes de confirmar tu orden.', 'Carrito vacío');
      return;
    }

    clearAllErrors();
    let hasValidationErrors = false;
    const ensureField = (field, message) => {
      if (!message) return;
      setFieldError(field, message);
      hasValidationErrors = true;
    };

    if (!contactData.nombre) {
      ensureField('nombre', 'El nombre es obligatorio');
    }
    if (!contactData.email) {
      ensureField('email', 'El correo es obligatorio');
    }
    if (!contactData.telefono) {
      ensureField('telefono', 'El teléfono es obligatorio');
    }

    if (shippingMethod !== 'retiro' && !selectedAddressId) {
      if (!newAddress.calle) {
        ensureField('calle', 'Indica la calle y número');
      }
      if (!newAddress.comuna) {
        ensureField('comuna', 'La comuna es obligatoria');
      }
      if (!newAddress.ciudad) {
        ensureField('ciudad', 'La ciudad es obligatoria');
      }
      if (!newAddress.region) {
        ensureField('region', 'Selecciona una región');
      }
    }

    if (hasValidationErrors) {
      alertWarning('Revisa los campos resaltados para continuar.', 'Datos incompletos');
      return;
    }

    // Preparar preview de la orden (sin crear nada en BD todavía)
    const preview = {
      items: cartItems,
      contacto: contactData,
      direccion: selectedAddressId 
        ? addresses.find(a => a.direccion_id === selectedAddressId) 
        : newAddress,
      metodo_despacho: shippingMethod,
      metodo_pago: paymentMethod,
      notas: notes,
      subtotal: total,
      envio: shippingCost,
      total: grandTotal,
      selectedAddressId,
    };

    setOrderPreview(preview);
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      const checkoutData = {
        metodo_despacho: orderPreview.metodo_despacho,
        metodo_pago: orderPreview.metodo_pago,
        notas_cliente: orderPreview.notas,
        contacto: orderPreview.contacto,
      };

      // Si usa dirección guardada
      if (orderPreview.selectedAddressId && orderPreview.metodo_despacho !== 'retiro') {
        checkoutData.usar_direccion_guardada = true;
        checkoutData.direccion_id = orderPreview.selectedAddressId;
      } 
      // Si es dirección nueva
      else if (orderPreview.metodo_despacho !== 'retiro') {
        checkoutData.usar_direccion_guardada = false;
        checkoutData.direccion_nueva = newAddress;
      };

      const response = await createOrder(checkoutData);

      if (response.success && response.data) {
        setShowConfirmDialog(false);
        clearCart();
        alertOrderSuccess(response.data.order_code).then(() => navigate('/profile'));
      } else {
        const msg = response.message || 'Error desconocido';
        if (/carrito está vacío/i.test(msg)) {
          alertOrderError('El carrito del servidor está vacío. Agrega productos antes de confirmar tu orden.', config.email);
        } else if (/Error al crear orden/i.test(msg)) {
          alertGlobalError();
        } else {
          alertOrderError(msg, config.email);
        }
      }

    } catch (error) {
      const serverMsg = error.response?.data?.message;
      debugError('[handleConfirmOrder] Error en checkout:', error);
      debugError('[handleConfirmOrder] error.response:', error.response);
      debugError('[handleConfirmOrder] error.response?.data:', error.response?.data);
      debugError('[handleConfirmOrder] serverMsg:', serverMsg);
      handleError(error, serverMsg || 'No pudimos crear tu orden en este momento.');
      if (serverMsg && /carrito está vacío/i.test(serverMsg)) {
        alertOrderError('El carrito del servidor está vacío. Agrega productos y vuelve a intentar.', config.email);
      } else if (serverMsg && /Error al crear orden/i.test(serverMsg)) {
        alertGlobalError();
      } else {
        alertOrderError(serverMsg || error.message || 'Error desconocido', config.email);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="page container-px mx-auto max-w-6xl py-12">
      <header className="mb-10 space-y-3">
        <h1 className="title-serif text-4xl text-(--color-primary1)">Checkout</h1>
        <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary)">
          Completa los datos del envío boutique o programa un retiro. Nos encargaremos de
          coordinar cada detalle para que tus piezas lleguen impecables.
        </p>
      </header>

      {hasItems ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos del contacto y pago</CardTitle>
                <CardDescription>Usaremos esta información para coordinar la entrega y procesar tu pedido.</CardDescription>
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
                      aria-invalid={Boolean(fieldErrors.nombre)}
                    />
                    {fieldErrors.nombre && (
                      <p className="text-xs text-(--color-error)">{fieldErrors.nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label required>Correo</Label>
                    <Input 
                      type="email" 
                      placeholder="andrea@estudio.cl" 
                      autoComplete="email"
                      value={contactData.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-(--color-error)">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label required>Teléfono</Label>
                    <Input 
                      type="tel" 
                      placeholder="+56 9 5555 5555" 
                      autoComplete="tel"
                      value={contactData.telefono}
                      onChange={(e) => handleContactChange('telefono', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.telefono)}
                    />
                    {fieldErrors.telefono && (
                      <p className="text-xs text-(--color-error)">{fieldErrors.telefono}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label required>Método de pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar método de pago" />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
                        <SelectItem value="transferencia">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <span>Transferencia bancaria</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="webpay">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Webpay Plus (Transbank)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="tarjeta_credito">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Tarjeta de crédito</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="tarjeta_debito">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>Tarjeta de débito</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="link_pago">
                          <div className="flex items-center gap-2">
                            <MessageSquareHeart className="h-4 w-4" />
                            <span>Link de pago por email</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="efectivo">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4" />
                            <span>Efectivo contra entrega</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                        <Select
                          value={selectedAddressId ? selectedAddressId.toString() : 'new'}
                          onValueChange={(val) => {
                            if (val === 'new') {
                              setSelectedAddressId(null);
                            } else {
                              const parsed = parseInt(val, 10);
                              setSelectedAddressId(Number.isNaN(parsed) ? null : parsed);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar dirección" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nueva dirección personalizada</SelectItem>
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
                            aria-invalid={Boolean(fieldErrors.calle)}
                          />
                          {fieldErrors.calle && (
                            <p className="text-xs text-(--color-error)">{fieldErrors.calle}</p>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label required>Comuna</Label>
                            <Input 
                              placeholder="Providencia" 
                              autoComplete="address-level3"
                              value={newAddress.comuna}
                              onChange={(e) => handleAddressChange('comuna', e.target.value)}
                              aria-invalid={Boolean(fieldErrors.comuna)}
                            />
                            {fieldErrors.comuna && (
                              <p className="text-xs text-(--color-error)">{fieldErrors.comuna}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label required>Ciudad</Label>
                            <Input 
                              placeholder="Santiago" 
                              autoComplete="address-level2"
                              value={newAddress.ciudad}
                              onChange={(e) => handleAddressChange('ciudad', e.target.value)}
                              aria-invalid={Boolean(fieldErrors.ciudad)}
                            />
                            {fieldErrors.ciudad && (
                              <p className="text-xs text-(--color-error)">{fieldErrors.ciudad}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label required>Región</Label>
                            <Select
                              value={newAddress.region || ''}
                              onValueChange={(val) => handleAddressChange('region', val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar región" />
                              </SelectTrigger>
                              <SelectContent className="w-[--radix-select-trigger-width] max-h-72 overflow-auto">
                                {CHILE_REGIONES.map(r => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldErrors.region && (
                              <p className="text-xs text-(--color-error)">{fieldErrors.region}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notas al equipo</Label>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Accesos al edificio, horarios preferidos…"
                      maxLength={280}
                    />
                    <p className="text-right text-xs text-(--color-text-muted)">
                      {notes.length}/280 caracteres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de piezas</CardTitle>
                <CardDescription>
                  {cartItems.length} producto{cartItems.length === 1 ? "" : "s"} listos para envío
                </CardDescription>
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
                        className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-white/70 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#44311417]">
                            <img src={displayImage} alt={item.name ?? "Producto"} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-display text-sm text-(--color-primary2)">{item.name}</p>
                            <p className="text-xs text-(--color-text-muted)">
                              Cantidad: {quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Price value={itemPrice * quantity} className="text-sm font-semibold text-(--color-primary1)" />
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className={buttonClasses({
                              variant: "ghost",
                              size: "icon",
                              className: "h-8 w-8",
                            })}
                            aria-label={`Quitar ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-(--color-text-muted)">
                    <span>Subtotal</span>
                    <Price value={total} />
                  </div>
                  <div className="flex items-center justify-between text-(--color-text-muted)">
                    <span>Envío</span>
                    {shippingCost ? (
                      <Price value={shippingCost} />
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary4) px-2 py-1 text-xs font-semibold text-(--color-primary1)">
                        Gratis
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold text-(--color-primary1)">
                    <span>Total</span>
                    <Price value={grandTotal} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="button"
                  size="md"
                  className="w-full justify-center text-white"
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

            <Card className="bg-(--color-lightest)">
              <CardHeader>
                <CardTitle>¿Necesitas coordinación especial?</CardTitle>
                <CardDescription>Estamos disponibles para alinear horarios o detalles con tu estudio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-(--color-text-secondary)">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-(--color-primary1)" />
                  <span>Desembalaje y staging en la Región Metropolitana.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-(--color-primary1)" />
                  <span>Recibirás el link de pago directo a tu correo al finalizar el proceso.</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquareHeart className="h-5 w-5 text-(--color-primary1)" />
                  <span>¿Dudas? Escríbenos por WhatsApp o coordina una videollamada.</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  to={API_PATHS.support.contact}
                  className={buttonClasses({
                    variant: "outline",
                    size: "md",
                    className: "w-full justify-center",
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
          <div className="rounded-full bg-(--color-primary4)/70 p-6 text-(--color-primary1)">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-(--color-primary2)">Aún no seleccionas piezas</h2>
            <p className="text-sm text-(--color-text-secondary) max-w-md">
              Vuelve al catálogo y agrega productos para continuar con el checkout.
            </p>
          </div>
          <Link
            to={API_PATHS.products.products}
            className={buttonClasses({
              variant: "ghost",
              size: "md",
              className: "text-(--color-primary1)",
            })}
          >
            Explorar catálogo
          </Link>
        </Card>
      )}

      {/* Modal de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-(--color-primary1)">
              <CheckCircle2 className="h-6 w-6 text-(--color-primary1)" />
              Confirmar pedido
            </DialogTitle>
            <DialogDescription className="text-(--color-primary1)">
              Revisa los detalles de tu orden antes de confirmar. Una vez confirmada, se procesará tu pedido.
            </DialogDescription>
          </DialogHeader>

          {orderPreview && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Productos */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-(--color-secondary2)">Productos ({orderPreview.items.length})</h3>
                <div className="space-y-2">
                  {orderPreview.items.map((item) => {
                    const quantity = Number(item.quantity) || 1;
                    const itemPrice = resolveProductPrice(item) ?? 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--color-lightest) p-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={buildItemImage(item)} 
                            alt={item.name} 
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-(--color-primary2)">{item.name}</p>
                            <p className="text-xs text-(--color-text-muted)">Cantidad: {quantity}</p>
                          </div>
                        </div>
                        <Price value={itemPrice * quantity} className="text-sm font-semibold" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Contacto */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-(--color-secondary2)">Datos de contacto</h3>
                <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-3 text-sm">
                  <p><span className="font-medium">Nombre:</span> {orderPreview.contacto.nombre}</p>
                  <p><span className="font-medium">Email:</span> {orderPreview.contacto.email}</p>
                  <p><span className="font-medium">Teléfono:</span> {orderPreview.contacto.telefono}</p>
                </div>
              </div>

              {/* Dirección */}
              {orderPreview.metodo_despacho !== 'retiro' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-(--color-secondary2)">Dirección de envío</h3>
                  <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-3 text-sm">
                    {orderPreview.direccion?.calle && (
                      <>
                        <p>{orderPreview.direccion.calle}</p>
                        <p>{orderPreview.direccion.comuna}, {orderPreview.direccion.ciudad}</p>
                        <p>{orderPreview.direccion.region}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Método de envío y pago */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-(--color-secondary2)">Método de envío</h3>
                  <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-3 text-sm">
                    <p className="flex items-center gap-2 capitalize">
                      {orderPreview.metodo_despacho === 'retiro' ? (
                        <Store className="h-4 w-4 text-(--color-primary1)" />
                      ) : (
                        <Truck className="h-4 w-4 text-(--color-primary1)" />
                      )}
                      {METODOS_DESPACHO[orderPreview.metodo_despacho]?.label || orderPreview.metodo_despacho}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-(--color-secondary2)">Método de pago</h3>
                  <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-3 text-sm">
                    <p className="flex items-center gap-2 capitalize">
                      {orderPreview.metodo_pago === 'transferencia' ? (
                        <Banknote className="h-4 w-4 text-(--color-primary1)" />
                      ) : orderPreview.metodo_pago === 'efectivo' ? (
                        <CircleDollarSign className="h-4 w-4 text-(--color-primary1)" />
                      ) : orderPreview.metodo_pago === 'webpay' ? (
                        <CreditCard className="h-4 w-4 text-(--color-primary1)" />
                      ) : (
                        <Wallet className="h-4 w-4 text-(--color-primary1)" />
                      )}
                      {orderPreview.metodo_pago.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {orderPreview.notas && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-(--color-secondary2)">Notas</h3>
                  <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-3 text-sm">
                    <p>{orderPreview.notas}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="space-y-3 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--color-secondary2)">Subtotal</span>
                  <Price value={orderPreview.subtotal} className="font-semibold" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--color-secondary2)">Envío</span>
                  {orderPreview.envio > 0 ? (
                    <Price value={orderPreview.envio} className="font-semibold" />
                  ) : (
                    <span className="font-semibold text-(--text-strong)">Gratis</span>
                  )}
                </div>
                <div className="border-t border-neutral-300 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-(--color-primary1)">Total</span>
                    <Price value={orderPreview.total} className="text-(--color-primary1)" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              Volver a editar
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={isProcessing}
              className="text-white"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar y crear orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

CheckoutPage.propTypes = {
  cartItems: PropTypes.arrayOf(cartItemShape),
  total: PropTypes.number,
  user: userShape,
  addresses: PropTypes.arrayOf(addressShape),
  defaultAddress: addressShape,
  config: configShape,
};

CheckoutPage.defaultProps = {
  cartItems: undefined,
  total: undefined,
  user: undefined,
  addresses: undefined,
  defaultAddress: undefined,
  config: undefined,
};
