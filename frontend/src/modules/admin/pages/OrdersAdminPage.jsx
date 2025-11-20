import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Eye,
  Edit,
  FileText,
  Calendar,
  User,
  Mail,
  MapPin,
  CreditCard,
  Box,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Bell,
  BellOff,
} from 'lucide-react';

import { ordersAdminApi } from '@/services/ordersAdmin.api.js';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { StatusPill } from '@/components/ui/StatusPill.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Alert } from '@/components/ui/Alert.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Pagination } from '@/components/ui/Pagination.jsx';
import { formatCurrencyCLP } from '@/utils/currency.js';
import { formatDate_ddMMyyyy, formatDateTime, relativeTime } from '@/utils/date.js';

// Estados válidos
const ESTADOS_PAGO = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesando', label: 'Procesando' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'fallido', label: 'Fallido' },
  { value: 'reembolsado', label: 'Reembolsado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const ESTADOS_ENVIO = [
  { value: '', label: 'Todos' },
  { value: 'preparacion', label: 'En Preparación' },
  { value: 'empaquetado', label: 'Empaquetado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'en_transito', label: 'En Tránsito' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'devuelto', label: 'Devuelto' },
];

const METODOS_DESPACHO = [
  { value: '', label: 'Todos' },
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'retiro', label: 'Retiro en Tienda' },
];

// Mapa de colores para estados
const ESTADO_PAGO_COLORS = {
  pendiente: 'warning',
  procesando: 'info',
  pagado: 'success',
  fallido: 'error',
  reembolsado: 'neutral',
  cancelado: 'neutral',
};

const ESTADO_ENVIO_COLORS = {
  preparacion: 'warning',
  empaquetado: 'info',
  enviado: 'info',
  en_transito: 'primary',
  entregado: 'success',
  devuelto: 'error',
};

/**
 * Sistema de notificaciones en memoria
 */
class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(message, type = 'info') {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    this.notifications.push(notification);
    this.subscribers.forEach(cb => cb(this.notifications));
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      this.remove(notification.id);
    }, 5000);
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.subscribers.forEach(cb => cb(this.notifications));
  }

  clear() {
    this.notifications = [];
    this.subscribers.forEach(cb => cb([]));
  }
}

const notificationSystem = new NotificationSystem();

/**
 * Componente de Notificaciones
 */
function NotificationCenter({ enabled }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = notificationSystem.subscribe(setNotifications);
    return unsubscribe;
  }, [enabled]);

  if (!enabled || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notif => (
        <Alert
          key={notif.id}
          type={notif.type}
          className="shadow-lg animate-slide-in-right"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm flex-1">{notif.message}</p>
            <button
              onClick={() => notificationSystem.remove(notif.id)}
              className="text-neutral-400 hover:text-neutral-600 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
}

/**
 * Modal de Historial de Cambios
 */
function ChangeHistoryModal({ order, onClose }) {
  // En producción, esto vendría del backend
  const mockHistory = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      user: 'Admin Usuario',
      action: 'Estado actualizado',
      details: `De "preparacion" a "enviado"`,
      field: 'estado_envio',
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Sistema',
      action: 'Tracking agregado',
      details: 'CHX123456789 - Chilexpress',
      field: 'tracking',
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Admin Usuario',
      action: 'Notas internas actualizadas',
      details: 'Cliente solicitó entrega urgente',
      field: 'notas_internas',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary1" />
            <h2 className="text-xl font-semibold text-primary1">
              Historial de Cambios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold">Orden:</span> {order.order_code}
            </p>
            <p className="text-sm text-neutral-600">
              <span className="font-semibold">Cliente:</span> {order.usuario_nombre} ({order.usuario_email})
            </p>
          </div>

          {mockHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No hay historial de cambios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative pl-8 pb-4"
                  style={{
                    borderLeft: index < mockHistory.length - 1 ? '2px solid var(--color-border)' : 'none',
                  }}
                >
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary1 border-2 border-white" />
                  
                  <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-neutral-800">{entry.action}</p>
                        <p className="text-sm text-neutral-500">{entry.details}</p>
                      </div>
                      <Badge intent="neutral" size="sm">
                        {entry.field}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-400 mt-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {relativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <Button appearance="solid" intent="primary" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de Edición de Estado
 */
function EditStatusModal({ order, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estado_pago: order.estado_pago || '',
    estado_envio: order.estado_envio || '',
    notas_internas: order.notas_internas || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      notificationSystem.notify('Estado actualizado exitosamente', 'success');
      onClose();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      notificationSystem.notify('Error al actualizar estado', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-primary1" />
            <h2 className="text-xl font-semibold text-primary1">
              Actualizar Estado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold">Orden:</span> {order.order_code}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Estado de Pago
            </label>
            <Select
              value={formData.estado_pago}
              onChange={(e) => setFormData({ ...formData, estado_pago: e.target.value })}
              className="w-full"
            >
              {ESTADOS_PAGO.filter(e => e.value).map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Estado de Envío
            </label>
            <Select
              value={formData.estado_envio}
              onChange={(e) => setFormData({ ...formData, estado_envio: e.target.value })}
              className="w-full"
            >
              {ESTADOS_ENVIO.filter(e => e.value).map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Notas Internas
            </label>
            <textarea
              value={formData.notas_internas}
              onChange={(e) => setFormData({ ...formData, notas_internas: e.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary1/20 focus:border-primary1"
              placeholder="Notas internas (solo visible para admins)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              appearance="ghost"
              intent="neutral"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              appearance="solid"
              intent="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal de Detalle de Orden
 */
function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordersAdminApi.getById(orderId);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error al cargar orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <p className="text-neutral-600 mb-6">{error || 'Orden no encontrada'}</p>
          <Button appearance="solid" intent="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary1" />
            <div>
              <h2 className="text-xl font-semibold text-primary1">
                {order.order_code}
              </h2>
              <p className="text-sm text-neutral-500">
                {formatDateTime(order.creado_en)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Estados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500 mb-2">Estado de Pago</p>
              <StatusPill
                status={order.estado_pago}
                intent={ESTADO_PAGO_COLORS[order.estado_pago]}
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500 mb-2">Estado de Envío</p>
              <StatusPill
                status={order.estado_envio}
                intent={ESTADO_ENVIO_COLORS[order.estado_envio]}
              />
            </div>
          </div>

          {/* Cliente */}
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary1" />
              Información del Cliente
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">Nombre</p>
                  <p className="text-sm text-neutral-600">{order.usuario_nombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-700">Email</p>
                  <p className="text-sm text-neutral-600">{order.usuario_email}</p>
                </div>
              </div>
              {order.usuario_telefono && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Teléfono</p>
                    <p className="text-sm text-neutral-600">{order.usuario_telefono}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          {order.calle && (
            <div className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary1" />
                Dirección de Envío
              </h3>
              <div className="space-y-1 text-sm text-neutral-600">
                <p>{order.calle} {order.numero} {order.depto_oficina && `- ${order.depto_oficina}`}</p>
                <p>{order.comuna}, {order.ciudad}</p>
                <p>{order.region}, {order.pais}</p>
                {order.codigo_postal && <p>CP: {order.codigo_postal}</p>}
                {order.telefono_contacto && <p>Tel: {order.telefono_contacto}</p>}
                {order.instrucciones_entrega && (
                  <p className="mt-2 italic">"{order.instrucciones_entrega}"</p>
                )}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.numero_seguimiento && (
            <div className="rounded-2xl border border-neutral-200 bg-primary4/20 p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary1" />
                Información de Seguimiento
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Número de tracking:</span>
                  <span className="text-sm font-semibold text-neutral-800">{order.numero_seguimiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Empresa:</span>
                  <span className="text-sm font-semibold text-neutral-800">{order.empresa_envio}</span>
                </div>
                {order.fecha_envio && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Fecha de envío:</span>
                    <span className="text-sm font-semibold text-neutral-800">
                      {formatDateTime(order.fecha_envio)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Box className="h-5 w-5 text-primary1" />
              Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4"
                >
                  {item.producto_img && (
                    <img
                      src={item.producto_img}
                      alt={item.producto_nombre}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{item.producto_nombre}</p>
                    <p className="text-sm text-neutral-500">SKU: {item.producto_sku}</p>
                    <p className="text-sm text-neutral-600">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">
                      {formatCurrencyCLP((item.precio_unit * item.cantidad) / 100)}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatCurrencyCLP(item.precio_unit / 100)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-medium text-neutral-800">
                  {formatCurrencyCLP((order.subtotal_cents || 0) / 100)}
                </span>
              </div>
              {order.envio_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Envío:</span>
                  <span className="font-medium text-neutral-800">
                    {formatCurrencyCLP((order.envio_cents || 0) / 100)}
                  </span>
                </div>
              )}
              {order.descuento_cents > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Descuento:</span>
                  <span className="font-medium">
                    -{formatCurrencyCLP((order.descuento_cents || 0) / 100)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-300 pt-3 flex justify-between">
                <span className="text-lg font-semibold text-neutral-800">Total:</span>
                <span className="text-lg font-bold text-primary1">
                  {formatCurrencyCLP((order.total_cents || 0) / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {(order.notas_cliente || order.notas_internas) && (
            <div className="space-y-4">
              {order.notas_cliente && (
                <div className="rounded-2xl border border-neutral-200 p-6">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">Notas del Cliente</h3>
                  <p className="text-sm text-neutral-600">{order.notas_cliente}</p>
                </div>
              )}
              {order.notas_internas && (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6">
                  <h3 className="text-sm font-semibold text-warning mb-2">Notas Internas (Admin)</h3>
                  <p className="text-sm text-warning/80">{order.notas_internas}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <Button appearance="solid" intent="primary" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente Principal: OrdersAdminPage
 */
export default function OrdersAdminPage() {
  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    estado_pago: '',
    estado_envio: '',
    metodo_despacho: '',
    fecha_desde: '',
    fecha_hasta: '',
  });
  
  // Paginación
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });

  // Modales
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Notificaciones
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Cargar órdenes
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
        order_by: 'creado_en',
        order_dir: 'DESC',
      };

      // Remover parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ordersAdminApi.getAll(params);
      setOrders(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar órdenes');
      notificationSystem.notify('Error al cargar órdenes', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await ordersAdminApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Efectos
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handlers
  const handleSearch = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset a primera página
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);

  const handlePageChange = useCallback((newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  const handleUpdateStatus = useCallback(async (orderId, data) => {
    try {
      await ordersAdminApi.updateStatus(orderId, data);
      await fetchOrders();
      notificationSystem.notify(`Orden ${orderId} actualizada`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }, [fetchOrders]);

  const handleExportCSV = useCallback(() => {
    try {
      const blob = ordersAdminApi.exportToCSV(orders);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordenes-moa-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationSystem.notify(`${orders.length} órdenes exportadas a CSV`, 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      notificationSystem.notify('Error al exportar CSV', 'error');
    }
  }, [orders]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      estado_pago: '',
      estado_envio: '',
      metodo_despacho: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);

  // Stats computadas
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== '');
  }, [filters]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-primary1" />
            <h1 className="text-3xl font-bold text-primary1">
              Gestión de Pedidos
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>

          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            onClick={handleExportCSV}
            disabled={orders.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </header>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Total Órdenes</p>
              <Package className="h-5 w-5 text-primary1" />
            </div>
            <p className="text-2xl font-bold text-neutral-800">
              {stats.total_ordenes || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Pagadas</p>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">
              {stats.pagadas || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Pendientes</p>
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">
              {stats.pendientes || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">En Tránsito</p>
              <Truck className="h-5 w-5 text-info" />
            </div>
            <p className="text-2xl font-bold text-info">
              {(stats.enviadas || 0) + (stats.en_transito || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar por código, email o nombre..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12"
            />
          </div>

          <Button
            appearance="ghost"
            intent="neutral"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Estado de Pago
                </label>
                <Select
                  value={filters.estado_pago}
                  onChange={(e) => handleFilterChange('estado_pago', e.target.value)}
                  className="w-full"
                >
                  {ESTADOS_PAGO.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Estado de Envío
                </label>
                <Select
                  value={filters.estado_envio}
                  onChange={(e) => handleFilterChange('estado_envio', e.target.value)}
                  className="w-full"
                >
                  {ESTADOS_ENVIO.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Método de Despacho
                </label>
                <Select
                  value={filters.metodo_despacho}
                  onChange={(e) => handleFilterChange('metodo_despacho', e.target.value)}
                  className="w-full"
                >
                  {METODOS_DESPACHO.map(metodo => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Fecha Desde
                </label>
                <Input
                  type="date"
                  value={filters.fecha_desde}
                  onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Fecha Hasta
                </label>
                <Input
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-2">
                <Button
                  appearance="ghost"
                  intent="neutral"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert de filtros activos */}
      {hasActiveFilters && (
        <Alert type="info">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              Mostrando resultados filtrados ({pagination.total})
            </span>
            <Button
              appearance="ghost"
              intent="neutral"
              size="sm"
              onClick={clearFilters}
            >
              Mostrar todos
            </Button>
          </div>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert type="error">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {/* Tabla de órdenes */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-lg text-neutral-600 mb-2">No se encontraron órdenes</p>
            <p className="text-sm text-neutral-500">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las órdenes aparecerán aquí cuando los clientes realicen compras'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Orden
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Pago
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Envío
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((order) => (
                    <tr
                      key={order.orden_id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-neutral-800">
                            {order.order_code}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {order.total_items || 0} items
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-800">
                            {order.usuario_nombre}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {order.usuario_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-800">
                          {formatCurrencyCLP((order.total_cents || 0) / 100)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill
                          status={order.estado_pago}
                          intent={ESTADO_PAGO_COLORS[order.estado_pago]}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill
                          status={order.estado_envio}
                          intent={ESTADO_ENVIO_COLORS[order.estado_envio]}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-neutral-600">
                          {formatDate_ddMMyyyy(order.creado_en)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {relativeTime(order.creado_en)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            appearance="ghost"
                            intent="neutral"
                            size="sm"
                            onClick={() => setSelectedOrderId(order.orden_id)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            appearance="ghost"
                            intent="primary"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                            title="Editar estado"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            appearance="ghost"
                            intent="neutral"
                            size="sm"
                            onClick={() => setShowHistory(order)}
                            title="Ver historial"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.total > pagination.limit && (
              <div className="border-t border-neutral-200 p-4">
                <Pagination
                  currentPage={Math.floor(pagination.offset / pagination.limit) + 1}
                  totalPages={Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={(page) => {
                    const newOffset = (page - 1) * pagination.limit;
                    handlePageChange(newOffset);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {editingOrder && (
        <EditStatusModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={(data) => handleUpdateStatus(editingOrder.orden_id, data)}
        />
      )}

      {showHistory && (
        <ChangeHistoryModal
          order={showHistory}
          onClose={() => setShowHistory(null)}
        />
      )}

      {/* Sistema de notificaciones */}
      <NotificationCenter enabled={notificationsEnabled} />
    </section>
  );
}
