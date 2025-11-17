import React, { useState, useMemo } from "react";
import { Mail, Phone, Calendar, RefreshCw, UserPlus, MoreHorizontal, Eye, Edit3, Ban, ShoppingBag, LayoutGrid, Rows } from "lucide-react";
import CustomerDrawer from "../components/CustomerDrawer.jsx";
import OrdersDrawer from "../components/OrdersDrawer.jsx";
import { DataTableV2 } from "../../../components/data-display/DataTableV2.jsx";
import {
  TableToolbar,
  TableSearch,
  FilterTags,
  ToolbarSpacer,
  ColumnsMenuButton,
  ClearFiltersButton,
} from "../../../components/data-display/TableToolbar.jsx";
import { Button, IconButton } from "../../../components/ui/Button.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/radix/DropdownMenu.jsx";
import { customersDb } from "../../../mocks/database/customers.js";
import { ordersDb } from "../../../mocks/database/orders.js";
import { formatDate_ddMMyyyy } from "../../../utils/date.js";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";

const USER_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "suspended", label: "Suspendido" },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [condensed] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" o "grid"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null); // Para mostrar de dónde viene la orden

  const limit = 10; // Reducir a 10 para mejor visualización

  // Helper para cargar una orden completa con sus relaciones
  const loadFullOrder = (order) => {
    const items = ordersDb.orderItems.filter((item) => item.orderId === order.id);
    const payment = ordersDb.payments.find((p) => p.id === order.paymentId);
    const shipment = ordersDb.shipping.find((s) => s.id === order.shipmentId);
    const address = customersDb.addresses.find((a) => a.id === order.addressId);
    const user = customersDb.users.find((u) => u.id === order.userId);

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

  const handleViewOrder = (order) => {
    const fullOrder = loadFullOrder(order);
    const customer = selectedCustomer;
    setBreadcrumb(customer ? `${customer.firstName} ${customer.lastName}` : null);
    setSelectedOrder(fullOrder);
  };

  const handleCloseOrder = () => {
    setSelectedOrder(null);
    setBreadcrumb(null);
  };

  // Filtrado de datos
  const filteredData = useMemo(() => {
    const customersList = customersDb?.users ?? [];
    let filtered = [...customersList];

    // Búsqueda por nombre o email
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [search]);

  // Paginación
  const total = filteredData.length;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  // Calcular pedidos por cliente
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

  // Handler para cambiar status de cliente
  const handleStatusChange = (customerId, newStatus) => {
    console.log("Cambiar status de", customerId, "a", newStatus);
    // TODO: Implementar actualización de status en backend
    // Por ahora solo lo mostramos en consola
  };

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Cliente",
        enableSorting: true,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex flex-col gap-0.5 px-1 py-2">
              <span className="text-sm font-medium text-(--text-strong)">
                {customer.firstName} {customer.lastName}
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
        accessorKey: "phone",
        header: "Teléfono",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return customer.phone ? (
            <div className="flex items-center gap-1 px-1 py-2 text-sm text-(--text-weak)">
              <Phone className="h-3.5 w-3.5" />
              {customer.phone}
            </div>
          ) : (
            <span className="px-1 py-2 text-sm text-(--color-text-muted)">—</span>
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
        header: "Estado",
        enableSorting: true,
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
                    <StatusPill status={customer.status} />
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
                    aria-label={`Acciones para ${customer.firstName}`}
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
                      console.log("Editar cliente:", customer);
                      // TODO: Abrir formulario de edición
                    }}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      if (confirm(`¿Desactivar a ${customer.firstName} ${customer.lastName}?`)) {
                        console.log("Desactivar cliente:", customer);
                        // TODO: Implementar desactivación
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
    [customerOrders]
  );

  const clearAll = () => {
    setSearch("");
    setActiveTags([]);
    setPage(1);
  };

  const toolbar = useMemo(
    () => (table) => (
      <TableToolbar>
        <TableSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por nombre, email…"
        />
        <ToolbarSpacer />
        <FilterTags
          tags={activeTags}
          onRemove={(tag) => {
            setActiveTags((tags) =>
              tags.filter((t) => !(t.key === tag.key && t.value === tag.value))
            );
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <ColumnsMenuButton table={table} />
          <ClearFiltersButton onClear={clearAll} />
          
          {/* Botones de Layout List/Grid */}
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
            onClick={() => {
              console.log("Refrescar datos");
              // TODO: Implementar refetch cuando tengamos API real
            }}
            leadingIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refrescar
          </Button>
          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            leadingIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              console.log("Crear nuevo cliente");
              // TODO: Abrir modal/formulario
            }}
          >
            Nuevo cliente
          </Button>
        </div>
      </TableToolbar>
    ),
    [search, activeTags, viewMode]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-primary">
            Clientes
          </h1>
          <p className="text-sm text-(--text-weak)">
            Gestiona la comunidad de usuarios registrados en MOA. {total} clientes en total.
          </p>
        </div>
      </div>

      {/* Tabla con toolbar integrado */}
      {viewMode === "list" ? (
        <DataTableV2
          columns={columns}
          data={paginatedData}
          loading={false}
          page={page}
          pageSize={limit}
          total={total}
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
            {paginatedData.map((customer) => {
              const orderCount = customerOrders[customer.id] || 0;
              return (
                <div
                  key={customer.id}
                  className="rounded-lg border border-(--color-border) bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-(--text-strong)">
                        {customer.firstName} {customer.lastName}
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
          {total > limit && (
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
                  Página {page} de {Math.ceil(total / limit)}
                </span>
                <Button
                  appearance="ghost"
                  size="sm"
                  disabled={page >= Math.ceil(total / limit)}
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
    </div>
  );
}
