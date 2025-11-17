import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import orderAdminModel from "../models/orderAdminModel.js";
import paymentModel from "../models/paymentModel.js";
import { getCartItems } from "../models/cartModel.js";
import { addressModel } from "../models/addressModel.js";

const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

const ORDER_STATUS_TRANSITIONS = {
  pending: () => ({
    estado_pago: 'pendiente',
    estado_envio: 'preparacion',
  }),
  processing: () => ({
    estado_pago: 'procesando',
    estado_envio: 'preparacion',
  }),
  shipped: () => ({
    estado_pago: 'pagado',
    estado_envio: 'enviado',
  }),
  fulfilled: () => ({
    estado_pago: 'pagado',
    estado_envio: 'entregado',
    fecha_entrega_real: new Date().toISOString(),
  }),
  cancelled: () => ({
    estado_pago: 'cancelado',
    estado_envio: 'devuelto',
  }),
};

const buildOrderStatusPayload = (order, status) => ({
  ...order,
  status,
});

/**
 * Crear nueva orden desde el carrito
 */
const createOrderFromCart = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const {
      direccion_id,
      metodo_pago_id,
      metodo_despacho = 'standard',
      notas_cliente,
      usar_direccion_guardada = true,
      direccion_nueva, // Si no usa guardada, puede enviar nueva dirección
      contacto, // { nombre, email, telefono }
    } = req.body;

    // Validaciones
    if (!metodo_despacho) {
      return res.status(400).json({
        success: false,
        message: 'Método de despacho es requerido',
      });
    }

    // Si no es retiro, necesita dirección
    if (metodo_despacho !== 'retiro') {
      if (usar_direccion_guardada && !direccion_id) {
        return res.status(400).json({
          success: false,
          message: 'Dirección es requerida para envío',
        });
      }
      if (!usar_direccion_guardada && !direccion_nueva) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar datos de dirección',
        });
      }
    }

    // Obtener items del carrito
    const cartData = await getCartItems(usuarioId);
    
    if (!cartData.items || cartData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío',
      });
    }

    // Calcular subtotal desde los items del carrito
    const subtotal_cents = cartData.items.reduce((sum, item) => {
      return sum + (item.precio_unit * item.cantidad);
    }, 0);

    // Calcular costo de envío según método
    const envio_cents = metodo_despacho === 'express' ? 6900 : 0;

    // Preparar items para la orden
    const items = cartData.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unit: item.precio_unit,
    }));

    // Si es dirección nueva, crearla primero
    let direccion_id_final = direccion_id;
    if (metodo_despacho !== 'retiro' && !usar_direccion_guardada && direccion_nueva) {
      const nuevaDireccion = await addressModel.create(usuarioId, direccion_nueva);
      direccion_id_final = nuevaDireccion.direccion_id;
    }

    // Crear orden
    const orderData = {
      usuario_id: usuarioId,
      direccion_id: metodo_despacho === 'retiro' ? null : direccion_id_final,
      metodo_pago_id,
      metodo_despacho,
      items,
      subtotal_cents,
      envio_cents,
      descuento_cents: 0,
      impuestos_cents: 0,
      notas_cliente,
      metodo_pago_usado: 'Pendiente de pago', // Se actualizará cuando se procese
    };

    const orden = await orderModel.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: orden,
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtener órdenes del usuario
 */
const getUserOrders = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { limit = 20, offset = 0, estado_pago, estado_envio } = req.query;

    const orders = await orderModel.getOrdersByUserId(usuarioId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      estado_pago,
      estado_envio,
    });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtener orden por ID
 */
const getOrderById = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Verificar que la orden pertenezca al usuario
    if (order.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-11-15' })
  : null;

const formatCardDescriptor = (cardDetails) => {
  if (!cardDetails) return 'Tarjeta Stripe';
  const brand = cardDetails.brand ? `${cardDetails.brand[0].toUpperCase()}${cardDetails.brand.slice(1)}` : 'Tarjeta';
  const last4 = cardDetails.last4 || 'XXXX';
  return `${brand} terminada en ${last4}`;
};

const describePaymentIntentMethod = (paymentIntent) => {
  const charge = paymentIntent?.charges?.data?.[0];
  const cardDetails = charge?.payment_method_details?.card;
  return formatCardDescriptor(cardDetails);
};

const persistStripePaymentMethod = async (usuarioId, paymentMethodId, guardarMetodo = false) => {
  if (!guardarMetodo || !paymentMethodId) return null;
  const existing = await paymentModel.getByToken(paymentMethodId, usuarioId);
  if (existing) return existing;

  if (!stripeClient) {
    throw new Error('Stripe no está configurado para guardar métodos de pago.');
  }

  const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
  const card = paymentMethod.card ?? {};
  const tipo_metodo = card.funding === 'credit' ? 'credito' : 'debito';
  const month = card.exp_month ? String(card.exp_month).padStart(2, '0') : '00';
  const year = card.exp_year ? String(card.exp_year).slice(-2) : '00';
  const fecha_expiracion = `${month}/${year}`;

  return paymentModel.create({
    usuario_id: usuarioId,
    tipo_metodo,
    ultimos_digitos: card.last4 || "0000",
    nombre_titular: paymentMethod.billing_details?.name || 'Titular',
    fecha_expiracion,
    token_pago: paymentMethod.id,
    predeterminado: false,
    marca: card.brand || null,
    proveedor_pago: 'stripe',
    metadata: {
      country: card.country,
      funding: card.funding,
      brand: card.brand,
    },
  });
};

/**
 * Procesar pago de una orden (simulado)
 * En producción, esto integraría con Transbank/Flow/Stripe
 */
const processPayment = async (req, res) => {
  let order = null;
  try {
    if (!stripeClient) {
      return res.status(500).json({
        success: false,
        message: 'Stripe no está configurado para procesar pagos',
      });
    }

    const usuarioId = getRequestUserId(req);
    const { id } = req.params;
    const { metodo_pago_id, payment_method_id, guardar_metodo = false } = req.body;

    order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    if (order.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para procesar esta orden',
      });
    }

    if (order.estado_pago === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya fue pagada',
      });
    }

    let paymentMethodToken = payment_method_id;
    let savedMethod = null;

    if (metodo_pago_id) {
      savedMethod = await paymentModel.getById(metodo_pago_id, usuarioId);
      if (!savedMethod) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado',
        });
      }

      if (!savedMethod.token_pago) {
        return res.status(400).json({
          success: false,
          message: 'Este método no tiene un token validado',
        });
      }

      paymentMethodToken = savedMethod.token_pago;
    }

    if (!paymentMethodToken) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar un método de pago tokenizado',
      });
    }

    await orderModel.updatePaymentStatus(id, 'procesando');

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: order.total_cents,
      currency: 'clp',
      payment_method: paymentMethodToken,
      confirm: true,
      off_session: Boolean(savedMethod),
      description: `Orden ${order.order_code}`,
      metadata: {
        orden_id: order.orden_id,
        usuario_id: usuarioId,
      },
      receipt_email: order.usuario_email,
    });

    if (paymentIntent.status === 'succeeded') {
      await persistStripePaymentMethod(usuarioId, paymentIntent.payment_method, guardar_metodo);

      const updatedOrder = await orderModel.updatePaymentStatus(
        id,
        'pagado',
        paymentIntent.id,
        describePaymentIntentMethod(paymentIntent)
      );

      return res.status(200).json({
        success: true,
        message: 'Pago procesado exitosamente',
        data: updatedOrder,
      });
    }

    if (['requires_action', 'requires_payment_method'].includes(paymentIntent.status)) {
      return res.status(202).json({
        success: true,
        message: 'El pago requiere pasos adicionales',
        data: {
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret,
        },
      });
    }

    await orderModel.updatePaymentStatus(
      id,
      'fallido',
      paymentIntent.id,
      describePaymentIntentMethod(paymentIntent)
    );

    return res.status(402).json({
      success: false,
      message: 'El pago fue rechazado por la pasarela',
      data: {
        status: paymentIntent.status,
      },
    });

  } catch (error) {
    console.error('Error procesando pago:', error);

    if (order) {
      await orderModel.updatePaymentStatus(
        order.orden_id,
        'fallido',
        error?.payment_intent?.id || null,
        'Stripe: error inesperado'
      );
    }

    const StripeErrorClass = Stripe.errors?.StripeError;
    const friendlyMessage = StripeErrorClass && error instanceof StripeErrorClass
      ? error.message
      : 'Error al procesar el pago';

    res.status(500).json({
      success: false,
      message: friendlyMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Cancelar orden
 */
const cancelOrder = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    if (order.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta orden',
      });
    }

    if (order.estado_pago === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una orden ya pagada. Solicita un reembolso.',
      });
    }

    const canceledOrder = await orderModel.cancelOrder(id, usuarioId);

    if (!canceledOrder) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo cancelar la orden',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: canceledOrder,
    });

  } catch (error) {
    console.error('Error cancelando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'El campo status es requerido',
      });
    }

    const normalizedStatus = String(status).trim().toLowerCase();
    const builder = ORDER_STATUS_TRANSITIONS[normalizedStatus];
    if (!builder) {
      const allowedStatuses = Object.keys(ORDER_STATUS_TRANSITIONS).join(', ');
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores permitidos: ${allowedStatuses}`,
      });
    }

    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    await orderAdminModel.updateOrderStatus(id, builder());

    const updatedOrder = await orderAdminModel.getOrderByIdAdmin(id);
    const orderToReturn = updatedOrder ?? existingOrder;

    res.status(200).json({
      success: true,
      data: buildOrderStatusPayload(orderToReturn, normalizedStatus),
    });
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const orderController = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  processPayment,
  cancelOrder,
  updateOrderStatus,
};

export default orderController;
