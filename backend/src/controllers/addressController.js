import { addressModel } from "../models/addressModel.js";
import { AppError, NotFoundError } from "../utils/error.utils.js";

// Helper para obtener usuario_id del request
const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

/**
 * Obtener todas las direcciones del usuario autenticado
 */
export const getUserAddresses = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const addresses = await addressModel.getUserAddresses(usuarioId);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener dirección por ID
 */
export const getAddressById = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const address = await addressModel.getById(parseInt(id), usuarioId);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener dirección predeterminada
 */
export const getDefaultAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const address = await addressModel.getDefaultAddress(usuarioId);

    res.status(200).json({
      success: true,
      data: address, // puede ser null si no hay dirección predeterminada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva dirección
 */
export const createAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const {
      nombre_contacto,
      telefono_contacto,
      calle,
      numero,
      departamento,
      comuna,
      ciudad,
      region,
      codigo_postal,
      referencia,
      es_predeterminada
    } = req.body;

    // Validaciones básicas
    if (!nombre_contacto || !telefono_contacto || !calle || !numero || !comuna || !ciudad || !region) {
      throw new AppError('Faltan campos requeridos', 400);
    }

    const addressData = {
      usuario_id: usuarioId,
      nombre_contacto,
      telefono_contacto,
      calle,
      numero,
      departamento,
      comuna,
      ciudad,
      region,
      codigo_postal,
      referencia,
      es_predeterminada: es_predeterminada === true
    };

    const address = await addressModel.create(addressData);

    res.status(201).json({
      success: true,
      message: 'Dirección creada exitosamente',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar dirección existente
 */
export const updateAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const address = await addressModel.update(parseInt(id), usuarioId, req.body);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Establecer dirección como predeterminada
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const address = await addressModel.setAsDefault(parseInt(id), usuarioId);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección establecida como predeterminada',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar dirección
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const deleted = await addressModel.delete(parseInt(id), usuarioId);

    if (!deleted) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};
