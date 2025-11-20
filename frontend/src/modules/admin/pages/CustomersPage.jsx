import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Calendar, RefreshCw, UserPlus, MoreHorizontal, Eye, Edit3, Ban, ShoppingBag, LayoutGrid, Rows, ListFilter } from "lucide-react";
import CustomerDrawer from "@/modules/admin/components/CustomerDrawer.jsx"
import OrdersDrawer from "@/modules/admin/components/OrdersDrawer.jsx"
import { DataTableV2 } from "@/components/data-display/DataTableV2.jsx"
import { TableToolbar, TableSearch, FilterTags, ToolbarSpacer, LayoutToggleButton } from "../../../components/data-display/TableToolbar.jsx";
import { Button, IconButton } from "@/components/ui/Button.jsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/radix/DropdownMenu.jsx";
import { usersDb } from "@/mocks/database/users.js"
import { ordersDb } from "@/mocks/database/orders.js"
import { formatDate_ddMMyyyy } from "@/utils/date.js"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/radix/Dialog.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Pagination } from "@/components/ui/Pagination.jsx";
import { customersAdminApi } from "@/services/customersAdmin.api.js";

const USER_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "suspended", label: "Suspendido" },
];

const STATUS_FILTER_OPTIONS = USER_STATUS_OPTIONS.filter((option) => option.value);
const STATUS_LABEL_MAP = Object.fromEntries(
  STATUS_FILTER_OPTIONS.map((option) => [option.value, option.label])
);
const NEW_CUSTOMER_INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: STATUS_FILTER_OPTIONS[0]?.value ?? "active",
};

const getStatusLabel = (value) => STATUS_LABEL_MAP[value] ?? value;

const normalizeCustomerRecord = (customer = {}) => {
  const nameParts = String(customer.nombre ?? "").split(" ").filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  return {
    ...customer,
    status: customer.status ?? customer.rol ?? "activo",
    firstName,
    lastName,
    phone: customer.telefono ?? customer.phone ?? "",
  };
};

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [condensed, setCondensed] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" o "grid"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null); // Para mostrar de dónde viene la orden
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState(NEW_CUSTOMER_INITIAL);
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", email: "", telefono: "", status: "activo" });
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  const limit = 10; // Reducir a 10 para mejor visualización

  const {
    data: customersResponse,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["admin-customers", page, limit, search],
    queryFn: () => customersAdminApi.list({ page, limit, search }),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const customersData = customersResponse?.data ?? null;
  const customersList = useMemo(() => customersData?.items ?? [], [customersData?.items]);
  const totalCustomers = customersData?.total ?? customersList.length;
  const pageSize = customersData?.pageSize ?? limit;
  const pageCount = Math.max(1, Math.ceil(totalCustomers / pageSize));

  // Helper para cargar una orden completa con sus relaciones
  const loadFullOrder = (order) => {
    const items = ordersDb.orderItems.filter((item) => item.orderId === order.id);
    const payment = ordersDb.payments.find((p) => p.id === order.paymentId);
    const shipment = ordersDb.shipping.find((s) => s.id === order.shipmentId);
    const address = usersDb.addresses.find((a) => a.id === order.addressId);
    const user = usersDb.users.find((u) => u.id === order.userId);

    return {
      ...order,
      items,
      payment,
      shipment,
      address,
      userName: user ? `${user.firstName} ${user.lastName}` : "—",
      userEmail: user?.email ?? "—",
      userPhone: user?.phone ?? "—",
    };
  };

  const resetNewCustomerForm = useCallback(() => {
    setNewCustomerForm(NEW_CUSTOMER_INITIAL);
  }, []);

  const handleCancelNewCustomer = useCallback(() => {
    resetNewCustomerForm();
    setIsCreatingCustomer(false);
  }, [resetNewCustomerForm]);

  const handleCreateCustomer = useCallback(
    async (event) => {
      event.preventDefault();
      setIsCreatingSubmitting(true);
      try {
        const payload = {
          nombre:
            `${newCustomerForm.firstName.trim()} ${newCustomerForm.lastName.trim()}`.trim() ||
            newCustomerForm.firstName.trim(),
          email: newCustomerForm.email.trim(),
          telefono: newCustomerForm.phone.trim(),
          rol: newCustomerForm.status || "activo",
        };
        const response = await customersAdminApi.create(payload);
        const createdCustomer = response?.data?.data ?? response?.data ?? response;
        setSelectedCustomer(normalizeCustomerRecord(createdCustomer));
        refetchCustomers();
        setIsCreatingCustomer(false);
        resetNewCustomerForm();
        setPage(1);
      } catch (error) {
        console.error("Error creando cliente:", error);
        window.alert(error?.message ?? "No se pudo crear el cliente");
      } finally {
        setIsCreatingSubmitting(false);
      }
    },
    [newCustomerForm, resetNewCustomerForm, refetchCustomers, setPage, setSelectedCustomer],
  );

  const handleNewCustomerChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setNewCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchCustomers();
  }, [refetchCustomers]);

  const handleViewOrder = (order) => {
    const fullOrder = loadFullOrder(order);
    const customer = selectedCustomer;
    setBreadcrumb(customer ? customer.nombre : null);
    setSelectedOrder(fullOrder);
  };

  const handleCloseOrder = () => {
    setSelectedOrder(null);
    setBreadcrumb(null);
  };

  const enhancedCustomers = useMemo(
    () => customersList.map(normalizeCustomerRecord),
    [customersList],
  );

  const filteredCustomers = useMemo(() => {
    if (!statusFilter) return enhancedCustomers;
    return enhancedCustomers.filter((customer) => customer.status === statusFilter);
  }, [enhancedCustomers, statusFilter]);

  const customerOrders = useMemo(() => {
    const ordersMap = {};
    for (const order of ordersDb.orders) {
      if (!ordersMap[order.userId]) {
        ordersMap[order.userId] = 0;
      }
      ordersMap[order.userId]++;
    }
    return ordersMap;
  }, []);

  const handleStatusChange = useCallback(
    async (customerId, newStatus) => {
      try {
        await customersAdminApi.update(customerId, { rol: newStatus });
        refetchCustomers();
      } catch (error) {
        console.error("Error cambiando estado de cliente:", error);
        window.alert(error?.message ?? "No se pudo actualizar el estado del cliente");
      }
    },
    [refetchCustomers],
  );

  const handleOpenEditDialog = useCallback((customer) => {
    setEditingCustomer(customer);
    setEditForm({
      nombre: customer?.nombre ?? "",
      email: customer?.email ?? "",
      telefono: customer?.telefono ?? "",
      status: customer?.status ?? customer?.rol ?? "activo",
    });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditingCustomer(null);
    setEditForm({ nombre: "", email: "", telefono: "", status: "activo" });
  }, []);

  const handleEditFormChange = useCallback((field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  }, []);

  const handleUpdateCustomer = useCallback(
    async (event) => {
      event.preventDefault();
      if (!editingCustomer) return;
      setIsEditingSubmitting(true);
      try {
        const payload = {
          nombre: editForm.nombre.trim(),
          email: editForm.email.trim(),
          telefono: editForm.telefono.trim(),
          status: editForm.status,
        };
        const response = await customersAdminApi.update(editingCustomer.id, payload);
        const updated = response?.data?.data ?? response?.data ?? response;
        setSelectedCustomer(normalizeCustomerRecord(updated));
        refetchCustomers();
        handleCloseEditDialog();
      } catch (error) {
        console.error("Error editando cliente:", error);
        window.alert(error?.message ?? "No se pudo actualizar el cliente");
      } finally {
        setIsEditingSubmitting(false);
      }
    },
    [editingCustomer, editForm, refetchCustomers, handleCloseEditDialog, setSelectedCustomer],
  );

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Cliente",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex flex-col gap-0.5 px-1 py-2">
                <span className="text-sm font-medium text-(--text-strong)">
                  {customer.nombre}
                </span>
              <span className="flex items-center gap-1 text-xs text-(--color-text-muted)">
                <Mail className="h-3 w-3" />
                {customer.email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "orders",
        header: "Pedidos",
        enableSorting: true,
        cell: ({ row }) => {
          const customer = row.original;
          const orderCount = customerOrders[customer.id] || 0;
          return (
            <div className="flex items-center gap-1 px-1 py-2 text-sm">
              <ShoppingBag className="h-3.5 w-3.5 text-(--text-weak)" />
              <span className="font-medium tabular-nums">{orderCount}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-(--color-text-muted)">Estado</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  aria-label="Filtrar por estado"
                  intent="neutral"
                  size="xs"
                  icon={<ListFilter size={14} />}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onSelect={() => handleStatusFilter("")}
                  className="flex justify-between gap-2"
                >
                  <span>Todos los estados</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => handleStatusFilter(option.value)}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <StatusPill status={option.value} domain="user" />
                      <span className="text-xs text-(--color-text-muted)">{option.label}</span>
                    </div>
                    {statusFilter === option.value ? (
                      <span className="text-(--color-primary1)">✓</span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {statusFilter ? (
              <StatusPill status={statusFilter} domain="user" className="text-[10px]" />
            ) : null}
          </div>
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="px-1 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    aria-label="Cambiar estado"
                  >
                    <StatusPill status={customer.status} domain="user" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {USER_STATUS_OPTIONS.filter((opt) => opt.value).map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => handleStatusChange(customer.id, option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registro",
        enableSorting: true,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center gap-1 px-1 py-2 text-sm text-(--text-weak)">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate_ddMMyyyy(customer.createdAt)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center justify-end px-1 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    appearance="ghost"
                    intent="neutral"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label={`Acciones para ${customer.nombre}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedCustomer(customer);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      handleOpenEditDialog(customer);
                    }}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      if (confirm(`¿Desactivar a ${customer.nombre}?`)) {
                        handleStatusChange(customer.id, "inactive");
                      }
                    }}
                    className="text-(--color-error)"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Desactivar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [customerOrders, handleStatusFilter, statusFilter, handleOpenEditDialog, handleStatusChange]
  );

  const activeStatusTags = useMemo(() => {
    if (!statusFilter) return [];
    return [
      {
        key: "status",
        value: statusFilter,
        label: `Estado: ${getStatusLabel(statusFilter)}`,
      },
    ];
  }, [statusFilter]);

  const toolbar = useMemo(
    () => () => (
      <TableToolbar>
        <TableSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por nombre, email…"
          className="flex-1 max-w-md"
        />
        <FilterTags tags={activeStatusTags} onRemove={() => handleStatusFilter("")} />
        <div className="ml-auto flex items-center gap-2">
          <LayoutToggleButton condensed={condensed} onToggle={() => setCondensed((v) => !v)} />

          <div className="flex items-center gap-0.5 rounded-md border border-(--color-border) p-0.5">
            <IconButton
              appearance="ghost"
              intent={viewMode === "list" ? "primary" : "neutral"}
              size="sm"
              icon={<Rows className="h-4 w-4" />}
              onClick={() => setViewMode("list")}
              aria-label="Vista lista"
              className={viewMode === "list" ? "bg-(--color-primary1)/10" : ""}
            />
            <IconButton
              appearance="ghost"
              intent={viewMode === "grid" ? "primary" : "neutral"}
              size="sm"
              icon={<LayoutGrid className="h-4 w-4" />}
              onClick={() => setViewMode("grid")}
              aria-label="Vista grid"
              className={viewMode === "grid" ? "bg-(--color-primary1)/10" : ""}
            />
          </div>

          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            onClick={handleRefresh}
            leadingIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refrescar
          </Button>
          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            leadingIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsCreatingCustomer(true)}
          >
            Nuevo cliente
          </Button>
        </div>
      </TableToolbar>
    ),
    [search, activeStatusTags, viewMode, condensed, handleRefresh, handleStatusFilter]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary1 mb-2">
            Clientes
          </h1>
          <p className="text-sm text-(--text-weak)">
            Gestiona la comunidad de usuarios registrados en MOA. {totalCustomers} clientes en total.
          </p>
        </div>
      </div>

      {/* Tabla con toolbar integrado */}
      {viewMode === "list" ? (
        <DataTableV2
          columns={columns}
          data={filteredCustomers}
          loading={isLoadingCustomers}
          page={page}
          pageSize={pageSize}
          total={totalCustomers}
          onPageChange={setPage}
          toolbar={toolbar}
          condensed={condensed}
          variant="card"
        />
      ) : (
        <div>
          {/* Toolbar */}
          {toolbar(null)}
          
          {/* Grid View */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCustomers.map((customer) => {
              const orderCount = customerOrders[customer.id] || 0;
              return (
                <div
                  key={customer.id}
                  className="rounded-lg border border-(--color-border) bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-(--text-strong)">
                        {customer.nombre}
                      </h3>
                      <p className="mt-0.5 text-xs text-(--text-muted)">{customer.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 hover:bg-(--surface-subtle)">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedCustomer(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver perfil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-3 space-y-2 text-sm">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-(--text-weak)">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-(--text-weak)">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{orderCount} pedidos</span>
                    </div>
                    <div className="flex items-center gap-2 text-(--text-weak)">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate_ddMMyyyy(customer.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-(--color-border)">
                    <StatusPill status={customer.status} />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination for grid */}
          {totalCustomers > pageSize && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  appearance="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-(--text-weak)">
                  Página {page} de {pageCount}
                </span>
                <Button
                  appearance="ghost"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawers */}
      <CustomerDrawer
        open={!!selectedCustomer && !selectedOrder}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onViewOrder={handleViewOrder}
      />

      <OrdersDrawer
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={handleCloseOrder}
        breadcrumb={breadcrumb}
      />

      <Dialog
        open={isCreatingCustomer}
        onOpenChange={(open) => {
          if (!open) handleCancelNewCustomer();
        }}
      >
        <DialogContent className="space-y-4 max-w-lg">
          <DialogTitle>Nuevo cliente</DialogTitle>
          <p className="text-sm text-(--color-text-muted)">
            Registra manualmente a un cliente y prepara el payload para conectar con el backend cuando esté disponible.
          </p>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={newCustomerForm.firstName}
                onChange={handleNewCustomerChange("firstName")}
                required
              />
              <Input
                label="Apellido"
                value={newCustomerForm.lastName}
                onChange={handleNewCustomerChange("lastName")}
                required
              />
            </div>
            <Input
              label="Correo"
              type="email"
              value={newCustomerForm.email}
              onChange={handleNewCustomerChange("email")}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              value={newCustomerForm.phone}
              onChange={handleNewCustomerChange("phone")}
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-(--color-text-muted)">Estado</label>
              <select
                value={newCustomerForm.status}
                onChange={handleNewCustomerChange("status")}
                className="w-full rounded-lg border border-(--color-border) bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-(--color-primary1) focus:bg-white"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="px-0">
              <Button appearance="ghost" intent="neutral" onClick={handleCancelNewCustomer} type="button">
                Cancelar
              </Button>
              <Button
                appearance="solid"
                intent="primary"
                type="submit"
                disabled={isCreatingSubmitting}
              >
                {isCreatingSubmitting ? "Creando..." : "Crear cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingCustomer)}
        onOpenChange={(open) => {
          if (!open) handleCloseEditDialog();
        }}
      >
        <DialogContent className="space-y-4 max-w-lg">
          <DialogTitle>Editar cliente</DialogTitle>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={editForm.nombre}
                onChange={handleEditFormChange("nombre")}
                required
              />
              <Input
                label="Correo"
                type="email"
                value={editForm.email}
                onChange={handleEditFormChange("email")}
                required
              />
            </div>
            <Input
              label="Teléfono"
              type="tel"
              value={editForm.telefono}
              onChange={handleEditFormChange("telefono")}
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-(--color-text-muted)">Estado</label>
              <select
                value={editForm.status}
                onChange={handleEditFormChange("status")}
                className="w-full rounded-lg border border-(--color-border) bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-(--color-primary1) focus:bg-white"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="px-0">
              <Button appearance="ghost" intent="neutral" onClick={handleCloseEditDialog} type="button">
                Cancelar
              </Button>
              <Button
                appearance="solid"
                intent="primary"
                type="submit"
                disabled={isEditingSubmitting}
              >
                {isEditingSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
