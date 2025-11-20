import { Router } from "express";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";
import { AdminController } from "../src/controllers/adminController.js";
import orderAdminController from "../src/controllers/orderAdminController.js";
import { asyncHandler } from "../src/utils/error.utils.js";

const router = Router();

// === RUTAS DE PEDIDOS ADMIN ===
router.get("/admin/pedidos/stats", verifyAdmin, asyncHandler(orderAdminController.getOrderStats));
router.get("/admin/pedidos", verifyAdmin, asyncHandler(orderAdminController.getAllOrders));
router.get("/admin/pedidos/:id", verifyAdmin, asyncHandler(orderAdminController.getOrderById));
router.patch("/admin/pedidos/:id/estado", verifyAdmin, asyncHandler(orderAdminController.updateOrderStatus));
router.put("/api/admin/orders/:id/status", verifyAdmin, asyncHandler(orderAdminController.updateOrderStatus));
router.post("/admin/pedidos/:id/seguimiento", verifyAdmin, asyncHandler(orderAdminController.addTrackingInfo));

// === RUTAS DE ANALYTICS ADMIN ===
router.get("/admin/analytics/dashboard", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));
router.get("/admin/analytics/sales", verifyAdmin, asyncHandler(AdminController.getSalesAnalytics));
router.get("/admin/analytics/conversion", verifyAdmin, asyncHandler(AdminController.getConversionMetrics));
router.get("/admin/analytics/products/top", verifyAdmin, asyncHandler(AdminController.getTopProducts));
router.get("/admin/analytics/categories", verifyAdmin, asyncHandler(AdminController.getCategoryAnalytics));
router.get("/admin/analytics/stock", verifyAdmin, asyncHandler(AdminController.getStockAnalytics));
router.get("/admin/analytics/orders/distribution", verifyAdmin, asyncHandler(AdminController.getOrderDistribution));

// === RUTAS DE PRODUCTOS ADMIN ===
router.get("/admin", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));

router.get("/admin/productos", verifyAdmin, (req, res) => {
  res.status(501).json({ message: "Listado de productos admin no implementado" });
});

router.post("/admin/productos", verifyAdmin, (req, res) => {
  res.status(501).json({ message: "Creación de producto admin no implementada" });
});

router.put("/admin/productos/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Actualización de producto admin ${id} no implementada` });
});

router.delete("/admin/productos/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Eliminación de producto admin ${id} no implementada` });
});

// === RUTAS DE USUARIOS ADMIN ===
router.get("/admin/usuarios", verifyAdmin, asyncHandler(AdminController.getUsers));
router.put("/admin/usuarios/:id/rol", verifyAdmin, asyncHandler(AdminController.updateUserRole));

router.post("/admin/clientes", verifyAdmin, asyncHandler(AdminController.createCustomer));
router.patch("/admin/clientes/:id", verifyAdmin, asyncHandler(AdminController.updateCustomer));

// === RUTAS DE CONFIGURACIÓN ADMIN ===
router.get("/admin/configuracion", verifyAdmin, asyncHandler(AdminController.getStoreConfig));
router.put("/admin/configuracion", verifyAdmin, asyncHandler(AdminController.updateStoreConfig));

export default router;
