import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

import { useAdminOrders } from '@/modules/admin/hooks/useAdminOrders.js';
import { ordersAdminApi } from '@/services/ordersAdmin.api.js';

import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { StatusPill } from '@/components/ui/StatusPill.jsx';
import { DataTableV2 } from '@/components/data-display/DataTableV2.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/radix/DropdownMenu.jsx';

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

const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  search: '',
  estado_pago: '',
  estado_envio: '',
  metodo_despacho: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const EXPORT_FORMATS = [
  { label: 'CSV', value: 'csv', extension: 'csv' },
  { label: 'Excel (XLSX)', value: 'xlsx', extension: 'xlsx' },
  { label: 'JSON', value: 'json', extension: 'json' },
];

const PAGE_ALERT_STYLES = {
  success: "border-[color:var(--color-success)] bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
  error: "border-[color:var(--color-error)] bg-[color:var(--color-error)]/10 text-[color:var(--color-error)]",
  warning: "border-[color:var(--color-warning)] bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
};

const compactFilters = (params = {}) => {
  const sanitized = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return;
    }
    sanitized[key] = value;
  });
  return sanitized;
};

const buildExportFileName = (extension) => {
  return `pedidos-moa-${new Date().toISOString().split('T')[0]}.${extension}`;
};

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

const formatEstado = (estado) => {
  if (!estado) return 'N/A';
  return estado
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w|(?:\s)\w/g, (char) => char.toUpperCase());
};

// Componente principal de filtros
function OrderFilters({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  isLoading,
  onResetFilters = () => {},
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
          onClick={onResetFilters}
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
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));

  // Estados para modales
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);
  
  // Estados para edición inline
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  useEffect(() => {
    if (!pageAlert) return;
    const timeoutId = setTimeout(() => setPageAlert(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [pageAlert]);

  // Hooks para datos
  const {
    orders,
    total,
    page,
    pageSize,
    isLoading,
    error,
    refetch
  } = useAdminOrders(filters);

  const ordersData = orders ?? [];

  const hasActiveFilters = useMemo(() => {
    const { page: _PAGE, limit: _LIMIT, ...rest } = filters;
    return Object.values(rest).some((value) => value);
  }, [filters]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const showPageAlert = useCallback((message, type = 'success') => {
    setPageAlert({ message, type });
  }, []);

  // Handlers para edición inline
  const handleStartEdit = useCallback((order) => {
    setEditingRowId(order.orden_id);
    setEditingValues({
      estado_pago: order.estado_pago,
      estado_envio: order.estado_envio,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditingValues({});
  }, []);

  const handleSaveInline = useCallback(async (order) => {
    try {
      setSavingRowId(order.orden_id);
      await ordersAdminApi.updateStatus(order.orden_id, editingValues);
      showPageAlert('Estado actualizado correctamente', 'success');
      setEditingRowId(null);
      setEditingValues({});
      refetch();
    } catch (error) {
      console.error('Error updating order:', error);
      showPageAlert('Error al actualizar el estado', 'error');
    } finally {
      setSavingRowId(null);
    }
  }, [editingValues, refetch, showPageAlert]);

  const handleFieldChange = useCallback((field, value) => {
    setEditingValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const orderColumns = useMemo(
    () => [
      {
        accessorKey: "order_code",
        header: "Orden",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-mono text-sm font-semibold text-(--text-strong)">
              {row.original.order_code}
            </p>
            <p className="text-xs text-(--text-secondary1)">
              {formatDateTime(row.original.creado_en)}
            </p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-(--text-strong)">
              {row.original.usuario_nombre || "N/A"}
            </p>
            <p className="text-xs text-(--text-secondary1)">
              {row.original.usuario_email || "N/A"}
            </p>
          </div>
        ),
      },
      {
        id: "total",
        header: "Total",
        meta: { align: "right" },
        cell: ({ row }) => (
          <div className="space-y-1 text-right">
            <p className="text-sm font-semibold text-(--text-strong)">
              {formatCurrencyCLP(row.original.total_cents)}
            </p>
            <p className="text-xs text-(--text-secondary1)">
              {row.original.total_items ?? 0}{" "}
              {row.original.total_items === 1 ? "item" : "items"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "estado_pago",
        header: "Pago",
        cell: ({ row }) => {
          const isEditing = editingRowId === row.original.orden_id;
          
          if (isEditing) {
            return (
              <Select
                value={editingValues.estado_pago || row.original.estado_pago}
                onChange={(e) => handleFieldChange('estado_pago', e.target.value)}
                className="w-full min-w-[140px]"
                size="sm"
              >
                {ESTADOS_PAGO.filter(e => e.value).map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Select>
            );
          }
          
          return (
            <StatusPill
              status={row.original.estado_pago}
              intent={getStatusColor(row.original.estado_pago, 'pago')}
              size="sm"
            >
              {formatEstado(row.original.estado_pago)}
            </StatusPill>
          );
        },
      },
      {
        accessorKey: "estado_envio",
        header: "Envío",
        cell: ({ row }) => {
          const isEditing = editingRowId === row.original.orden_id;
          
          if (isEditing) {
            return (
              <Select
                value={editingValues.estado_envio || row.original.estado_envio}
                onChange={(e) => handleFieldChange('estado_envio', e.target.value)}
                className="w-full min-w-[140px]"
                size="sm"
              >
                {ESTADOS_ENVIO.filter(e => e.value).map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Select>
            );
          }
          
          return (
            <StatusPill
              status={row.original.estado_envio}
              intent={getStatusColor(row.original.estado_envio, 'envio')}
              size="sm"
            >
              {formatEstado(row.original.estado_envio)}
            </StatusPill>
          );
        },
      },
      {
        id: "metodo_despacho",
        header: "Despacho",
        cell: ({ row }) => {
          const comuna = row.original.comuna;
          const region = row.original.region;
          const method = row.original.metodo_despacho
            ? formatEstado(row.original.metodo_despacho)
            : "Standard";
          return (
            <div className="space-y-1">
              <p className="text-sm text-(--text-strong)">{method}</p>
              {comuna && (
                <p className="text-xs text-(--text-secondary1)">
                  {comuna}
                  {region ? `, ${region}` : ""}
                </p>
              )}
            </div>
          );
        },
      },
    ],
    [editingRowId, editingValues, handleFieldChange],
  );

  const orderRowActions = useCallback((row) => {
    const isEditing = editingRowId === row.orden_id;
    const isSaving = savingRowId === row.orden_id;
    
    if (isEditing) {
      return [
        {
          label: isSaving ? "Guardando..." : "Guardar",
          icon: Save,
          onAction: () => handleSaveInline(row),
          disabled: isSaving,
        },
        {
          label: "Cancelar",
          icon: X,
          onAction: handleCancelEdit,
          disabled: isSaving,
        },
      ];
    }
    
    return [
      {
        label: "Ver detalles",
        icon: Eye,
        onAction: () => handleViewDetails(row),
      },
      {
        label: "Editar estado",
        icon: Edit,
        onAction: () => handleStartEdit(row),
      },
    ];
  }, [editingRowId, savingRowId, handleSaveInline, handleCancelEdit, handleViewDetails, handleStartEdit]);

  const emptyStateMessage = hasActiveFilters ? (
    <div className="flex flex-col items-center gap-3 text-(--text-secondary1)">
      <p>No se encontraron órdenes con los filtros aplicados.</p>
      <Button
        appearance="outline"
        intent="primary"
        size="sm"
        onClick={resetFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  ) : (
    <div className="text-(--text-secondary1)">Aún no se han registrado órdenes en el sistema.</div>
  );

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
  }, []);

  const handleSaveStatus = useCallback(async (ordenId, data) => {
    await ordersAdminApi.updateStatus(ordenId, data);
    refetch();
  }, [refetch]);

  const handleExport = useCallback(async (format) => {
    if (ordersData.length === 0) {
      showPageAlert('No hay órdenes para exportar', 'warning');
      return;
    }

    try {
      setIsExporting(true);
      const filtersWithoutPagination = { ...filters };
      delete filtersWithoutPagination.page;
      delete filtersWithoutPagination.limit;
      const params = {
        ...compactFilters(filtersWithoutPagination),
        order_by: 'creado_en',
        order_dir: 'DESC',
      };

      const blob = await ordersAdminApi.exportOrders(params, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const formatConfig = EXPORT_FORMATS.find((item) => item.value === format);
      const extension = formatConfig?.extension || format;
      link.href = url;
      link.download = buildExportFileName(extension);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showPageAlert(`${formatConfig?.label ?? format.toUpperCase()} listo para descargar`, 'success');
    } catch (error) {
      console.error('Error exporting orders:', error);
      showPageAlert('Error al exportar pedidos', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [filters, ordersData.length, showPageAlert]);

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
      {pageAlert && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${PAGE_ALERT_STYLES[pageAlert.type] || PAGE_ALERT_STYLES.success}`}
        >
          {pageAlert.message}
        </div>
      )}
      <AdminPageHeader
        title="Pedidos"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                appearance="solid"
                intent="primary"
                size="sm"
                iconPlacement="only"
                icon={<Download className="h-4 w-4" />}
                loading={isExporting}
                disabled={ordersData.length === 0 || isExporting}
                aria-label="Exportar pedidos"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {EXPORT_FORMATS.map((format) => (
                <DropdownMenuItem
                  key={format.value}
                  onSelect={() => handleExport(format.value)}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <DataTableV2
        columns={orderColumns}
        data={ordersData}
        loading={isLoading}
        rowActions={orderRowActions}
        toolbar={
          <OrderFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={refetch}
            isLoading={isLoading}
            onResetFilters={resetFilters}
          />
        }
        emptyMessage={emptyStateMessage}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        variant="card"
        maxHeight="calc(100vh - 320px)"
      />

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
