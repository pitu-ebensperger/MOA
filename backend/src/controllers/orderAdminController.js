import orderAdminModel from "../models/orderAdminModel.js";

const getAllOrders = async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      estado_pago,
      estado_envio,
      metodo_despacho,
      fecha_desde,
      fecha_hasta,
      search,
      order_by = 'creado_en',
      order_dir = 'DESC',
    } = req.query;

    const result = await orderAdminModel.getAllOrders({
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      estado_pago,
      estado_envio,
      metodo_despacho,
      fecha_desde,
      fecha_hasta,
      search,
      order_by,
      order_dir,
    });

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Error obteniendo órdenes (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/*GET /admin/pedidos/:id */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderAdminModel.getOrderByIdAdmin(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/*PATCH /admin/pedidos/:id/estado
PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado_pago,
      estado_envio,
      notas_internas,
      fecha_pago,
      fecha_envio,
      fecha_entrega_real,
      numero_seguimiento,
      empresa_envio,
    } = req.body;

    // Validar que al menos un campo esté presente
    if (!estado_pago && !estado_envio && !notas_internas && !fecha_pago && !fecha_envio && !fecha_entrega_real && !numero_seguimiento && !empresa_envio) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar',
      });
    }

    // Validar valores de estados si están presentes
    const validEstadosPago = ['pendiente', 'procesando', 'pagado', 'fallido', 'reembolsado', 'cancelado'];
    if (estado_pago && !validEstadosPago.includes(estado_pago)) {
      return res.status(400).json({
        success: false,
        message: `Estado de pago inválido. Valores permitidos: ${validEstadosPago.join(', ')}`,
      });
    }

    const validEstadosEnvio = ['preparacion', 'empaquetado', 'enviado', 'en_transito', 'entregado', 'devuelto'];
    if (estado_envio && !validEstadosEnvio.includes(estado_envio)) {
      return res.status(400).json({
        success: false,
        message: `Estado de envío inválido. Valores permitidos: ${validEstadosEnvio.join(', ')}`,
      });
    }

    // Validar empresas de envío válidas
    const validEmpresasEnvio = ['Chilexpress', 'Blue Express', 'Starken', 'Correos de Chile', 'Retiro en tienda'];
    if (empresa_envio && !validEmpresasEnvio.includes(empresa_envio)) {
      return res.status(400).json({
        success: false,
        message: `Empresa de envío inválida. Valores permitidos: ${validEmpresasEnvio.join(', ')}`,
      });
    }

    // Verificar que la orden existe
    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Actualizar
    const updatedOrder = await orderAdminModel.updateOrderStatus(id, {
      estado_pago,
      estado_envio,
      notas_internas,
      fecha_pago,
      fecha_envio,
      fecha_entrega_real,
      numero_seguimiento,
      empresa_envio,
    });

    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: updatedOrder,
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

/*POST /admin/pedidos/:id/seguimiento */
const addTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_seguimiento,
      empresa_envio,
      fecha_envio,
    } = req.body;

    // Validar campos requeridos
    if (!numero_seguimiento || !empresa_envio) {
      return res.status(400).json({
        success: false,
        message: 'numero_seguimiento y empresa_envio son requeridos',
      });
    }

    // Verificar que la orden existe
    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Agregar tracking
    const updatedOrder = await orderAdminModel.addTrackingInfo(id, {
      numero_seguimiento,
      empresa_envio,
      fecha_envio,
    });

    res.status(200).json({
      success: true,
      message: 'Información de seguimiento agregada exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error agregando información de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar información de seguimiento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const stats = await orderAdminModel.getOrderStats({
      fecha_desde,
      fecha_hasta,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


//TODO: revisar si internal notes va a ir o si se elimina

const updateInternalNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas_internas } = req.body;

    if (notas_internas === undefined) {
      return res.status(400).json({
        success: false,
        message: 'notas_internas es requerido',
      });
    }

    // Verificar que la orden existe
    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    const updatedOrder = await orderAdminModel.updateInternalNotes(id, notas_internas);

    res.status(200).json({
      success: true,
      message: 'Notas internas actualizadas exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error actualizando notas internas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notas internas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const orderAdminController = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  addTrackingInfo,
  getOrderStats,
  updateInternalNotes,
};

export default orderAdminController;
