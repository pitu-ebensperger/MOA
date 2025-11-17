import paymentModel from "../models/paymentModel.js";

const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

/**
 * Obtener todos los métodos de pago del usuario
 */
const getUserPaymentMethods = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const paymentMethods = await paymentModel.getByUserId(usuarioId);

    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener método de pago por ID
 */
const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getRequestUserId(req);

    const paymentMethod = await paymentModel.getById(id, usuarioId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    console.error('Error obteniendo método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nuevo método de pago
 */
const createPaymentMethod = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const {
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      token_pago,
      predeterminado
    } = req.body;

    // Validar campos requeridos
    if (!tipo_metodo || !ultimos_digitos || !nombre_titular || !fecha_expiracion || !token_pago) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: tipo_metodo, ultimos_digitos, nombre_titular, fecha_expiracion, token_pago'
      });
    }

    // Validar tipo de método
    const tiposValidos = ['credito', 'debito'];
    if (!tiposValidos.includes(tipo_metodo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de método inválido. Debe ser: credito, debito'
      });
    }

    const newPaymentMethod = await paymentModel.create({
      usuario_id: usuarioId,
      tipo_metodo,
      ultimos_digitos,
      nombre_titular,
      fecha_expiracion,
      token_pago,
      predeterminado
    });

    res.status(201).json({
      success: true,
      message: 'Método de pago creado exitosamente',
      data: newPaymentMethod
    });
  } catch (error) {
    console.error('Error creando método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar método de pago existente
 */
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getRequestUserId(req);
    const { nombre_titular, fecha_expiracion } = req.body;

    // Validar que el método existe y pertenece al usuario
    const existingMethod = await paymentModel.getById(id, usuarioId);
    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }

    const updatedPaymentMethod = await paymentModel.update(id, usuarioId, {
      nombre_titular,
      fecha_expiracion
    });

    res.status(200).json({
      success: true,
      message: 'Método de pago actualizado exitosamente',
      data: updatedPaymentMethod
    });
  } catch (error) {
    console.error('Error actualizando método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Establecer método de pago como predeterminado
 */
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getRequestUserId(req);

    // Validar que el método existe y pertenece al usuario
    const existingMethod = await paymentModel.getById(id, usuarioId);
    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }

    const updatedPaymentMethod = await paymentModel.setAsDefault(id, usuarioId);

    res.status(200).json({
      success: true,
      message: 'Método de pago establecido como predeterminado',
      data: updatedPaymentMethod
    });
  } catch (error) {
    console.error('Error estableciendo método de pago predeterminado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer método de pago predeterminado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar método de pago
 */
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = getRequestUserId(req);

    // Validar que el método existe y pertenece al usuario
    const existingMethod = await paymentModel.getById(id, usuarioId);
    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }

    // Prevenir eliminación si es el único método (opcional)
    const totalMethods = await paymentModel.countByUserId(usuarioId);
    if (totalMethods === 1) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu único método de pago'
      });
    }

    const deletedMethod = await paymentModel.remove(id, usuarioId);

    // Si eliminamos el método predeterminado, asignar otro automáticamente
    if (deletedMethod.predeterminado) {
      const remainingMethods = await paymentModel.getByUserId(usuarioId);
      if (remainingMethods.length > 0) {
        await paymentModel.setAsDefault(remainingMethods[0].metodo_pago_id, usuarioId);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Método de pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar método de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const paymentController = {
  getUserPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
};

export default paymentController;
