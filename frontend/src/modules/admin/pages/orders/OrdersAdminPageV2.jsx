import React, { useState, useCallback } from 'react';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  X,
  Calendar,
} from 'lucide-react';

import { useAdminOrders } from '@/modules/admin/hooks/useAdminOrders.js';
import { useAdminOrderStats } from '@/modules/admin/hooks/useAdminOrderStats.js';
import { ordersAdminApi } from '@/services/ordersAdmin.api.js';

import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { StatusPill } from '@/components/ui/StatusPill.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Pagination } from '@/components/ui/Pagination.jsx';

import { formatCurrencyCLP } from '@/utils/currency.js';
import { formatDateTime } from '@/utils/date.js';
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";

// Estados y opciones
const ESTADOS_PAGO = [
  { value: '', label: 'Todos los pagos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesando', label: 'Procesando' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'fallido', label: 'Fallido' },
  { value: 'reembolsado', label: 'Reembolsado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const ESTADOS_ENVIO = [
  { value: '', label: 'Todos los envíos' },
  { value: 'preparacion', label: 'En Preparación' },
  { value: 'empaquetado', label: 'Empaquetado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'en_transito', label: 'En Tránsito' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'devuelto', label: 'Devuelto' },
];

const METODOS_DESPACHO = [
  { value: '', label: 'Todos los métodos' },
  { value: 'standard', label: 'Standard (3-5 días)' },
  { value: 'express', label: 'Express (1-2 días)' },
  { value: 'retiro', label: 'Retiro en Tienda' },
];

// Mapeo de colores para estados
const getStatusColor = (estado, tipo) => {
  if (tipo === 'pago') {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'procesando': return 'info';
      case 'pagado': return 'success';
      case 'fallido': return 'error';
      case 'reembolsado': return 'neutral';
      case 'cancelado': return 'error';
      default: return 'neutral';
    }
  } else if (tipo === 'envio') {
    switch (estado) {
      case 'preparacion': return 'warning';
      case 'empaquetado': return 'info';
      case 'enviado': return 'info';
      case 'en_transito': return 'primary';
      case 'entregado': return 'success';
      case 'devuelto': return 'error';
      default: return 'neutral';
    }
  }
  return 'neutral';
};

// Componente de tarjeta de estadísticas
function StatsCard({ title, value, subtitle, icon, color = 'primary' }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
        {Icon && <Icon className={`h-5 w-5 text-${color}`} />}
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {subtitle && (
        <p className="text-[10px] uppercase tracking-wide text-neutral-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Componente principal de filtros
function OrderFilters({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  isLoading 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-4">
      {/* Filtros básicos */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por código de orden, cliente, email..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-3">
          <Button
            appearance="ghost"
            intent="primary"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filtros {showAdvanced ? 'menos' : 'más'}
          </Button>
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Estado de Pago
              </label>
              <Select
                value={filters.estado_pago || ''}
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
                value={filters.estado_envio || ''}
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
                value={filters.metodo_despacho || ''}
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
                Fecha desde
              </label>
              <Input
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Fecha hasta
              </label>
              <Input
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-end">
              <Button
                appearance="outline"
                intent="neutral"
                size="sm"
                onClick={() => onFiltersChange({ page: 1 })}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de fila de orden
function OrderRow({ order, onViewDetails, onEditStatus }) {
  const formatEstado = (estado) => {
    return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'N/A';
  };

  return (
    <tr className="hover:bg-neutral-50 border-b border-neutral-100">
      <td className="px-6 py-4">
        <div className="font-mono text-sm font-medium text-neutral-900">
          {order.order_code}
        </div>
        <div className="text-xs text-neutral-500">
          {formatDateTime(order.creado_en)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-neutral-900">
          {order.usuario_nombre || 'N/A'}
        </div>
        <div className="text-xs text-neutral-500">
          {order.usuario_email || 'N/A'}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-neutral-900">
          {formatCurrencyCLP(order.total_cents)}
        </div>
        <div className="text-xs text-neutral-500">
          {order.total_items} item{order.total_items !== 1 ? 's' : ''}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <StatusPill
          status={order.estado_pago}
          intent={getStatusColor(order.estado_pago, 'pago')}
          size="sm"
        >
          {formatEstado(order.estado_pago)}
        </StatusPill>
      </td>
      
      <td className="px-6 py-4">
        <StatusPill
          status={order.estado_envio}
          intent={getStatusColor(order.estado_envio, 'envio')}
          size="sm"
        >
          {formatEstado(order.estado_envio)}
        </StatusPill>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-neutral-600">
          {order.metodo_despacho ? formatEstado(order.metodo_despacho) : 'Standard'}
        </div>
        {order.comuna && (
          <div className="text-xs text-neutral-500">
            {order.comuna}, {order.region}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Button
            appearance="ghost"
            intent="primary"
            size="sm"
            onClick={() => onViewDetails(order)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={() => onEditStatus(order)}
            title="Editar estado"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Modal simple para ver detalles de orden
function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            Orden {order.order_code}
          </h2>
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <section>
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Cliente</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <p><strong>Nombre:</strong> {order.usuario_nombre || 'N/A'}</p>
              <p><strong>Email:</strong> {order.usuario_email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> {order.usuario_telefono || 'N/A'}</p>
            </div>
          </section>

          {/* Información de la orden */}
          <section>
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Detalles de la Orden</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <p><strong>Total:</strong> {formatCurrencyCLP(order.total_cents)}</p>
              <p><strong>Items:</strong> {order.total_items}</p>
              <p><strong>Estado de Pago:</strong> 
                <StatusPill
                  status={order.estado_pago}
                  intent={getStatusColor(order.estado_pago, 'pago')}
                  size="sm"
                  className="ml-2"
                >
                  {order.estado_pago}
                </StatusPill>
              </p>
              <p><strong>Estado de Envío:</strong> 
                <StatusPill
                  status={order.estado_envio}
                  intent={getStatusColor(order.estado_envio, 'envio')}
                  size="sm"
                  className="ml-2"
                >
                  {order.estado_envio}
                </StatusPill>
              </p>
              <p><strong>Método de Despacho:</strong> {order.metodo_despacho || 'Standard'}</p>
              <p><strong>Fecha de Creación:</strong> {formatDateTime(order.creado_en)}</p>
            </div>
          </section>

          {/* Dirección de envío */}
          {(order.comuna || order.ciudad) && (
            <section>
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Dirección de Envío</h3>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p>{order.comuna}, {order.ciudad}, {order.region}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal para editar estado
function EditStatusModal({ order, onClose, onSave }) {
  const [estado_pago, setEstadoPago] = useState(order?.estado_pago || '');
  const [estado_envio, setEstadoEnvio] = useState(order?.estado_envio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(order.orden_id, {
        estado_pago,
        estado_envio,
      });
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            Editar Estado - {order.order_code}
          </h2>
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Estado de Pago
            </label>
            <Select
              value={estado_pago}
              onChange={(e) => setEstadoPago(e.target.value)}
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
              value={estado_envio}
              onChange={(e) => setEstadoEnvio(e.target.value)}
              className="w-full"
            >
              {ESTADOS_ENVIO.filter(e => e.value).map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </Select>
          </div>

        </div>

        <div className="border-t border-neutral-200 p-6 flex gap-3 justify-end">
          <Button
            appearance="outline"
            intent="neutral"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            appearance="solid"
            intent="primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function OrdersAdminPage() {
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    estado_pago: '',
    estado_envio: '',
    metodo_despacho: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  // Estados para modales
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // Hooks para datos
  const { 
    orders, 
    total, 
    page, 
    pageSize, 
    totalPages, 
    isLoading, 
    error, 
    refetch 
  } = useAdminOrders(filters);

  const { stats, isLoading: statsLoading } = useAdminOrderStats();

  // Handlers
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
  }, []);

  const handleEditStatus = useCallback((order) => {
    setEditingOrder(order);
  }, []);

  const handleSaveStatus = useCallback(async (ordenId, data) => {
    await ordersAdminApi.updateStatus(ordenId, data);
    refetch();
  }, [refetch]);

  const handleExportCSV = useCallback(() => {
    // Implementar exportación CSV
    console.log('Exportar a CSV:', orders);
  }, [orders]);

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar órdenes
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error.message || 'Ha ocurrido un error inesperado'}
              </div>
              <div className="mt-3">
                <Button
                  appearance="outline"
                  intent="error"
                  size="sm"
                  onClick={refetch}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Pedidos"
        actions={
          <Button
            appearance="outline"
            intent="neutral"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4" />}
            disabled={orders.length === 0}
          >
            Exportar CSV
          </Button>
        }
      />

      {/* Estadísticas */}
      {statsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Órdenes"
            value={stats.total_ordenes || 0}
            icon={Package}
            color="primary"
          />
          <StatsCard
            title="Pagadas"
            value={stats.pagadas || 0}
            subtitle="Confirmadas"
            icon={CheckCircle}
            color="success"
          />
          <StatsCard
            title="En Proceso"
            value={stats.procesando || 0}
            subtitle="Siendo procesadas"
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="Entregadas"
            value={stats.entregadas || 0}
            subtitle="Completadas"
            icon={Truck}
            color="success"
          />
        </div>
      ) : null}

      {/* Filtros */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Tabla de órdenes */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        {isLoading ? (
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
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay órdenes
            </h3>
            <p className="text-neutral-500 mb-4">
              {Object.values(filters).some(v => v) 
                ? 'No se encontraron órdenes que coincidan con los filtros aplicados.'
                : 'Aún no se han registrado órdenes en el sistema.'
              }
            </p>
            {Object.values(filters).some(v => v) && (
              <Button
                appearance="outline"
                intent="primary"
                onClick={() => setFilters({ page: 1, limit: 20 })}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Envío
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Despacho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {orders.map((order) => (
                  <OrderRow
                    key={order.orden_id}
                    order={order}
                    onViewDetails={handleViewDetails}
                    onEditStatus={handleEditStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">
                Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total} órdenes
              </p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showFirstLast
              />
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {editingOrder && (
        <EditStatusModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
