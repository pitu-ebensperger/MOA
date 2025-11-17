import pool from "../../database/config.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.utils.js";

/**
 * Controlador para operaciones administrativas
 */
export class AdminController {
  
  /**
   * Obtener métricas del dashboard
   */
  static async getDashboardMetrics(req, res, next) {
    try {
      // TODO: Implementar consultas reales a la base de datos
      const metrics = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        orderStatusCounts: {
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        }
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener analytics de ventas
   */
  static async getSalesAnalytics(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      // TODO: Implementar consultas reales basadas en el período
      const salesData = {
        currentMonth: { revenue: 0, orders: 0, customers: 0 },
        previousMonth: { revenue: 0, orders: 0, customers: 0 },
        growthPercentage: 0,
        averageOrderValue: 0,
        totalTransactions: 0,
        dailyRevenue: [],
        weeklyRevenue: [],
        monthlyRevenue: []
      };

      res.json({
        success: true,
        data: salesData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener métricas de conversión
   */
  static async getConversionMetrics(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      // TODO: Implementar cálculos de conversión reales
      const conversionData = {
        overallRate: 0,
        visitorCount: 0,
        purchaserCount: 0,
        categoryRates: [],
        monthlyTrend: []
      };

      res.json({
        success: true,
        data: conversionData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener top productos
   */
  static async getTopProducts(req, res, next) {
    try {
      const { limit = 10, period = 'month' } = req.query;
      
      // TODO: Implementar consulta real para productos más vendidos
      const topProducts = [];

      res.json({
        success: true,
        data: topProducts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener analytics de categorías
   */
  static async getCategoryAnalytics(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      // TODO: Implementar analytics por categoría
      const categoryData = [];

      res.json({
        success: true,
        data: categoryData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener analytics de stock
   */
  static async getStockAnalytics(req, res, next) {
    try {
      // TODO: Implementar consultas de stock
      const stockData = {
        lowStockCount: 0,
        outOfStockCount: 0,
        totalItems: 0,
        lowStockProducts: [],
        outOfStockProducts: []
      };

      res.json({
        success: true,
        data: stockData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener distribución de órdenes
   */
  static async getOrderDistribution(req, res, next) {
    try {
      const { period = 'week' } = req.query;
      
      // TODO: Implementar distribución temporal de órdenes
      const distributionData = [];

      res.json({
        success: true,
        data: distributionData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener lista de usuarios (solo admins)
   */
  static async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          usuario_id AS id,
          public_id AS "publicId",
          nombre,
          email,
          telefono,
          rol,
          rol_code AS "rolCode",
          creado_en AS "createdAt"
        FROM usuarios
      `;
      
      const values = [];
      
      if (search) {
        query += ' WHERE nombre ILIKE $1 OR email ILIKE $1';
        values.push(`%${search}%`);
      }
      
      query += ` ORDER BY creado_en DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      
      // Contar total de usuarios
      let countQuery = 'SELECT COUNT(*) FROM usuarios';
      let countValues = [];
      
      if (search) {
        countQuery += ' WHERE nombre ILIKE $1 OR email ILIKE $1';
        countValues.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          items: result.rows,
          total,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar rol de usuario
   */
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { rol, rolCode } = req.body;

      if (!rol || !rolCode) {
        throw new ValidationError('Rol y código de rol son requeridos');
      }

      // Verificar que el usuario existe
      const userCheck = await pool.query(
        'SELECT usuario_id FROM usuarios WHERE usuario_id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Usuario');
      }

      // Evitar que un admin se quite sus propios privilegios
      if (parseInt(id) === req.user.id && rolCode.toLowerCase() !== 'admin') {
        throw new ForbiddenError('No puedes remover tus propios privilegios de administrador');
      }

      // Actualizar rol
      const updateResult = await pool.query(
        `UPDATE usuarios 
         SET rol = $1, rol_code = $2 
         WHERE usuario_id = $3 
         RETURNING usuario_id AS id, nombre, email, rol, rol_code AS "rolCode"`,
        [rol, rolCode, id]
      );

      res.json({
        success: true,
        message: 'Rol actualizado correctamente',
        data: updateResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener configuración de la tienda
   */
  static async getStoreConfig(req, res, next) {
    try {
      // TODO: Implementar tabla de configuraciones
      const defaultConfig = {
        nombre_tienda: 'MOA',
        descripcion: 'Muebles y decoración de diseño contemporáneo',
        direccion: 'Providencia 1234, Santiago, Chile',
        telefono: '+56 2 2345 6789',
        email: 'hola@moastudio.cl',
        instagram_url: 'https://instagram.com/moastudio',
        facebook_url: 'https://facebook.com/moastudio',
        twitter_url: 'https://twitter.com/moastudio'
      };

      res.json({
        success: true,
        data: defaultConfig
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar configuración de la tienda
   */
  static async updateStoreConfig(req, res, next) {
    try {
      const config = req.body;
      
      // TODO: Implementar actualización real de configuraciones
      
      res.json({
        success: true,
        message: 'Configuración actualizada correctamente',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
}