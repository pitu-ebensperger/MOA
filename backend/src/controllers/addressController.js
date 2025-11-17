import { addressModel } from "../models/addressModel.js";

/**
 * GET /api/direcciones
 * Obtener todas las direcciones del usuario autenticado
 */
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addresses = await addressModel.getByUserId(userId);
    
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error("Error obteniendo direcciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener direcciones",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/direcciones/:id
 * Obtener una dirección específica
 */
export const getAddressById = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;

    const address = await addressModel.getById(addressId, userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error("Error obteniendo dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/direcciones
 * Crear nueva dirección
 */
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressData = req.body;

    // Validaciones básicas
    const requiredFields = ['calle', 'comuna', 'ciudad', 'region'];
    const missingFields = requiredFields.filter(field => !addressData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
        missingFields
      });
    }

    // Si es la primera dirección, hacerla predeterminada automáticamente
    const addressCount = await addressModel.countByUserId(userId);
    if (addressCount === 0) {
      addressData.es_predeterminada = true;
    }

    const newAddress = await addressModel.create(userId, addressData);
    
    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      data: newAddress
    });
  } catch (error) {
    console.error("Error creando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/direcciones/:id
 * Actualizar dirección existente
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;
    const addressData = req.body;

    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await addressModel.getById(addressId, userId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    const updated = await addressModel.update(addressId, userId, addressData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "No se pudo actualizar la dirección"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dirección actualizada exitosamente",
      data: updated
    });
  } catch (error) {
    console.error("Error actualizando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/direcciones/:id/predeterminada
 * Establecer dirección como predeterminada
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;

    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await addressModel.getById(addressId, userId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    const updated = await addressModel.setAsDefault(addressId, userId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "No se pudo establecer como predeterminada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dirección establecida como predeterminada",
      data: updated
    });
  } catch (error) {
    console.error("Error estableciendo dirección predeterminada:", error);
    res.status(500).json({
      success: false,
      message: "Error al establecer dirección predeterminada",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/direcciones/:id
 * Eliminar dirección
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;

    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await addressModel.getById(addressId, userId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    // Verificar si es la única dirección
    const addressCount = await addressModel.countByUserId(userId);
    if (addressCount === 1) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu única dirección. Crea una nueva dirección antes de eliminar esta."
      });
    }

    const deleted = await addressModel.delete(addressId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No se pudo eliminar la dirección"
      });
    }

    // Si se eliminó la predeterminada, establecer otra como predeterminada
    if (deleted.es_predeterminada) {
      const addresses = await addressModel.getByUserId(userId);
      if (addresses.length > 0) {
        await addressModel.setAsDefault(addresses[0].direccion_id, userId);
      }
    }

    res.status(200).json({
      success: true,
      message: "Dirección eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error eliminando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar dirección",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
