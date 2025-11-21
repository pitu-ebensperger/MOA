import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from "@icons/lucide";

import { useAdminOrders } from '@/modules/admin/hooks/useAdminOrders.js';
import { ordersAdminApi } from '@/services/ordersAdmin.api.js';
import { useDebounce } from '@/hooks/useDebounce.js';

import { Button, IconButton } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { StatusPill } from '@/components/ui/StatusPill.jsx';
import { VirtualizedTable } from '@/components/data-display/VirtualizedTable.jsx';
import { TableToolbar, TableSearch } from '@/components/data-display/TableToolbar.jsx';
import { ResponsiveRowActions } from '@/components/ui/ResponsiveRowActions.jsx';
import { TooltipNeutral } from '@/components/ui/Tooltip.jsx';
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

// API solo devuelve CSV, así que restringimos la UI al formato soportado
const EXPORT_FORMATS = [
  { label: 'CSV', value: 'csv', extension: 'csv' },
];

const PAGE_ALERT_STYLES = {
  success: "border-(--color-success) bg-(--color-success)/10 text-(--color-success)",
  error: "border-(--color-error) bg-(--color-error)/10 text-(--color-error)",
  warning: "border-(--color-warning) bg-(--color-warning)/10 text-(--color-warning)",
};

const compactFilters = (params = {}) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === '' || value === null || value === undefined) {
      continue;
    }
    sanitized[key] = value;
  }
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

// Sin componente OrderFilters - se usa TableToolbar inline

// Componente principal
export default function OrdersAdminPage() {
  const navigate = useNavigate();
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para exportación y alertas
  const [isExporting, setIsExporting] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);
  
  // Estados para edición inline
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  // Aplicar debounce al campo search
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedFilters = useMemo(() => {
    return { ...filters, search: debouncedSearch };
  }, [filters.page, filters.limit, debouncedSearch, filters.estado_pago, filters.estado_envio, filters.metodo_despacho, filters.fecha_desde, filters.fecha_hasta]);

  useEffect(() => {
    if (!pageAlert) return;
    const timeoutId = setTimeout(() => setPageAlert(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [pageAlert]);

  // Hooks para datos con filtros debounced
  const {
    orders,
    total,
    page,
    pageSize,
    isLoading,
    error,
    refetch
  } = useAdminOrders(debouncedFilters);

  const ordersData = orders ?? [];

  const hasActiveFilters = useMemo(() => {
    const { page: _PAGE, limit: _LIMIT, ...rest } = filters;
    return Object.values(rest).some((value) => value);
  }, [filters]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
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

  const handleViewDetails = useCallback((order) => {
    navigate(`/admin/orders/${order.orden_id}`);
  }, [navigate]);

  // orderColumns ya no es necesario con VirtualizedTable (renderRow inline)
  // Se mantiene por si se necesita migrar de vuelta a DataTableV2
  const _orderColumns = useMemo(
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
              {row.original.userName || row.original.usuario_nombre || "N/A"}
            </p>
            <p className="text-xs text-(--text-secondary1)">
              {row.original.userEmail || row.original.usuario_email || "N/A"}
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
          key: "save",
          label: isSaving ? "Guardando..." : "Guardar",
          icon: Save,
          onAction: () => handleSaveInline(row),
          disabled: isSaving,
        },
        {
          key: "cancel",
          label: "Cancelar",
          icon: X,
          onAction: handleCancelEdit,
          disabled: isSaving,
        },
      ];
    }
    
    return [
      {
        key: "view",
        label: "Ver detalles",
        icon: Eye,
        onAction: () => handleViewDetails(row),
      },
      {
        key: "edit",
        label: "Editar estado",
        icon: Edit,
        onAction: () => handleStartEdit(row),
      },
    ];
  }, [editingRowId, savingRowId, handleSaveInline, handleCancelEdit, handleViewDetails, handleStartEdit]);

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

  const toolbar = useMemo(
    () => () => (
      <TableToolbar>
        <TableSearch
          value={filters.search || ''}
          onChange={(v) => handleFilterChange('search', v)}
          placeholder="Buscar por código, cliente, email…"
          className="flex-1 max-w-2xl"
        />
        <div className="ml-auto flex items-center gap-2">
          <TooltipNeutral label="Filtros avanzados" position="bottom">
            <IconButton
              appearance="ghost"
              intent={showAdvancedFilters ? "primary" : "neutral"}
              size="sm"
              icon={<Filter className="h-4 w-4" />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-label="Filtros avanzados"
              className={showAdvancedFilters ? "bg-(--color-primary1)/10" : ""}
            />
          </TooltipNeutral>
          <TooltipNeutral label="Refrescar pedidos" position="bottom">
            <IconButton
              appearance="ghost"
              intent="neutral"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refetch}
              aria-label="Refrescar pedidos"
            />
          </TooltipNeutral>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                appearance="solid"
                intent="primary"
                size="sm"
                leadingIcon={<Download className="h-4 w-4" />}
                loading={isExporting}
                disabled={ordersData.length === 0 || isExporting}
                aria-label="Exportar pedidos"
              >
                Exportar
              </Button>
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
        </div>
      </TableToolbar>
    ),
    [filters.search, showAdvancedFilters, isExporting, ordersData.length, handleFilterChange, refetch, handleExport]
  );

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
    <div className="flex flex-col gap-4">
      {pageAlert && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${PAGE_ALERT_STYLES[pageAlert.type] || PAGE_ALERT_STYLES.success}`}
        >
          {pageAlert.message}
        </div>
      )}
      <AdminPageHeader title="Pedidos" />

      {/* Toolbar */}
      {toolbar(null)}

      {/* Filtros Avanzados */}
      {showAdvancedFilters && (
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
                onClick={resetFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Virtualizada */}
      {isLoading ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">Cargando órdenes...</p>
        </div>
      ) : ordersData.length === 0 ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-8 text-center">
          {emptyStateMessage}
        </div>
      ) : (
        <VirtualizedTable
          data={ordersData}
          columns={[
            { key: 'orden', header: 'Orden', width: '200px' },
            { key: 'cliente', header: 'Cliente', width: '200px' },
            { key: 'total', header: 'Total', width: '150px' },
            { key: 'pago', header: 'Pago', width: '150px' },
            { key: 'envio', header: 'Envío', width: '150px' },
            { key: 'despacho', header: 'Despacho', width: '180px' },
            { key: 'acciones', header: '', width: '100px' },
          ]}
          renderRow={(order) => {
            const isEditing = editingRowId === order.orden_id;

            return (
              <div
                className="grid items-center"
                style={{
                  gridTemplateColumns: '200px 200px 150px 150px 150px 180px 100px',
                  height: '80px',
                }}
              >
                {/* Orden */}
                <div className="px-4 space-y-1">
                  <p className="font-mono text-sm font-semibold text-neutral-900">
                    {order.order_code}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(order.creado_en)}
                  </p>
                </div>

                {/* Cliente */}
                <div className="px-4 space-y-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {order.userName || order.usuario_nombre || 'N/A'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {order.userEmail || order.usuario_email || 'N/A'}
                  </p>
                </div>

                {/* Total */}
                <div className="px-4 text-right space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatCurrencyCLP(order.total_cents)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {order.total_items ?? 0} {order.total_items === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Estado Pago */}
                <div className="px-4">
                  {isEditing ? (
                    <Select
                      value={editingValues.estado_pago || order.estado_pago}
                      onChange={(e) => handleFieldChange('estado_pago', e.target.value)}
                      className="w-full"
                      size="sm"
                    >
                      {ESTADOS_PAGO.filter(e => e.value).map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <StatusPill
                      status={order.estado_pago}
                      intent={getStatusColor(order.estado_pago, 'pago')}
                      size="sm"
                    >
                      {formatEstado(order.estado_pago)}
                    </StatusPill>
                  )}
                </div>

                {/* Estado Envío */}
                <div className="px-4">
                  {isEditing ? (
                    <Select
                      value={editingValues.estado_envio || order.estado_envio}
                      onChange={(e) => handleFieldChange('estado_envio', e.target.value)}
                      className="w-full"
                      size="sm"
                    >
                      {ESTADOS_ENVIO.filter(e => e.value).map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <StatusPill
                      status={order.estado_envio}
                      intent={getStatusColor(order.estado_envio, 'envio')}
                      size="sm"
                    >
                      {formatEstado(order.estado_envio)}
                    </StatusPill>
                  )}
                </div>

                {/* Método Despacho */}
                <div className="px-4 space-y-1">
                  <p className="text-sm text-neutral-900">
                    {order.metodo_despacho ? formatEstado(order.metodo_despacho) : 'Standard'}
                  </p>
                  {order.comuna && (
                    <p className="text-xs text-neutral-500">
                      {order.comuna}{order.region ? `, ${order.region}` : ''}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="px-4 flex justify-end">
                  <ResponsiveRowActions
                    actions={orderRowActions(order)}
                    menuLabel={`Acciones para orden ${order.order_code}`}
                  />
                </div>
              </div>
            );
          }}
          rowHeight={80}
          overscan={5}
          className="mt-4"
        />
      )}

      {/* Paginación */}
      {ordersData.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total} órdenes
            </p>
            <div className="flex gap-2">
              <Button
                appearance="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </Button>
              <Button
                appearance="outline"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => handlePageChange(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
