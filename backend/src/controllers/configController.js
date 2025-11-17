import configModel from "../models/configModel.js";
import { handleError } from "../utils/error.utils.js";

/**
 * Controlador para gestionar la configuración de la tienda
 */
const configController = {
  /**
   * Obtener la configuración actual de la tienda
   * @route GET /api/config
   * @access Public
   */
  async getConfig(req, res) {
    try {
      const config = await configModel.getConfig();

      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Error en getConfig:", error);
      handleError(res, error, "Error al obtener la configuración");
    }
  },

  /**
   * Actualizar la configuración de la tienda
   * @route PUT /api/config
   * @access Private/Admin
   */
  async updateConfig(req, res) {
    try {
      const userId = req.user?.id_usuario;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
      }

      // Validar que el usuario sea admin
      if (!req.user?.es_admin) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para realizar esta acción",
        });
      }

      const configData = req.body;

      // Validación básica
      if (!configData || Object.keys(configData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Validar formato de email si se proporciona
      if (configData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(configData.email)) {
          return res.status(400).json({
            success: false,
            message: "Formato de email inválido",
          });
        }
      }

      // Validar URLs si se proporcionan
      const urlFields = ["instagram_url", "facebook_url", "twitter_url"];
      for (const field of urlFields) {
        if (configData[field]) {
          try {
            new URL(configData[field]);
          } catch {
            return res.status(400).json({
              success: false,
              message: `URL inválida en el campo ${field}`,
            });
          }
        }
      }

      const updatedConfig = await configModel.updateConfig(configData, userId);

      res.status(200).json({
        success: true,
        message: "Configuración actualizada correctamente",
        data: updatedConfig,
      });
    } catch (error) {
      console.error("Error en updateConfig:", error);
      handleError(res, error, "Error al actualizar la configuración");
    }
  },

  /**
   * Inicializar configuración con valores por defecto
   * @route POST /api/config/init
   * @access Private/Admin
   */
  async initializeConfig(req, res) {
    try {
      // Validar que el usuario sea admin
      if (!req.user?.es_admin) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para realizar esta acción",
        });
      }

      const config = await configModel.initializeConfig();

      res.status(201).json({
        success: true,
        message: "Configuración inicializada correctamente",
        data: config,
      });
    } catch (error) {
      console.error("Error en initializeConfig:", error);
      handleError(res, error, "Error al inicializar la configuración");
    }
  },
};

export default configController;
