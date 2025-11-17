import orderModel from "../models/orderModel.js";
import { getCartItems } from "../models/cartModel.js";
import { addressModel } from "../models/addressModel.js";

const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

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
    res.status(500).json({
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

/**
 * Procesar pago de una orden (simulado)
 * En producción, esto integraría con Transbank/Flow/Stripe
 */
const processPayment = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;
    const { metodo_pago_id, token_pago } = req.body;

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
        message: 'No tienes permiso para procesar esta orden',
      });
    }

    if (order.estado_pago === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya fue pagada',
      });
    }

    // AQUÍ iría la integración con pasarela de pago
    // Por ahora, simulamos un pago exitoso
    const transaccionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatedOrder = await orderModel.updatePaymentStatus(
      id,
      'pagado',
      transaccionId
    );

    res.status(200).json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar pago',
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

const orderController = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  processPayment,
  cancelOrder,
};

export default orderController;
