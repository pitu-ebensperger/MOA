import { env } from "@/config/env.js"
import { API_PATHS } from "@/config/api-paths.js"
import { apiClient } from "@/services/api-client.js"
import { delay } from "@/utils/delay.js"
import { buildQueryString } from "@/utils/https.js"
import { toNum } from "@/utils/number.js"
import { paginate } from "@/utils/pagination.js"

import { customersDb } from "@/mocks/database/customers.js"
import { ordersDb } from "@/mocks/database/orders.js"



const normalizeOrder = (raw = {}, extra = {}) => {
  const id = raw.id ?? null;

  return {
    id,
    number: raw.number ?? id,
    userId: raw.userId ?? null,

    status: raw.status ?? "pending",
    currency: raw.currency ?? "CLP",

    subtotal: toNum(raw.subtotal),
    shipping: toNum(raw.shipping),
    tax: toNum(raw.tax),
    total: toNum(raw.total),

    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? null,

    addressId: raw.addressId ?? null,
    paymentId: raw.paymentId ?? null,
    shipmentId: raw.shipmentId ?? null,

    items: extra.items ?? [],
    payment: extra.payment ?? null,
    shipment: extra.shipment ?? null,
    address: extra.address ?? null,

    userName: extra.userName ?? raw.userName ?? null,
    userEmail: extra.userEmail ?? raw.userEmail ?? null,
  };
};

/* Implentacion Mock ----------------------------------------------------------------------------------------------- */

function buildMockOrderView(order) {
  const items = ordersDb.orderItems.filter((it) => it.orderId === order.id);
  const payment = ordersDb.payments.find((p) => p.id === order.paymentId) ?? null;
  const shipment = ordersDb.shipping.find((s) => s.id === order.shipmentId) ?? null;
  const user =
    (customersDb?.users ?? []).find(
      (u) => String(u.id) === String(order.userId ?? ""),
    ) ?? null;
  const addressDirect = (customersDb?.addresses ?? []).find(
    (a) => String(a.id) === String(order.addressId ?? ""),
  ) ?? null;
  const userDefaultAddress = (customersDb?.addresses ?? []).find(
    (a) => String(a.userId) === String(order.userId ?? "") && a.isDefault,
  ) ?? null;

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null
    : null;
  const userEmail = user?.email ?? null;

  // Si quieres luego conectar con usersDb
  const extra = {
    items,
    payment,
    shipment,
    address: addressDirect ?? userDefaultAddress ?? null,
    userName,
    userEmail,
  };

  return normalizeOrder(order, extra);
}

const mockOrdersApi = {
  async list({ page = 1, limit = 20, status, q }) {
    await delay();

    let list = [...ordersDb.orders];

    /* Filtrar por status */
    if (status) {
      const s = String(status).toLowerCase();
      list = list.filter((o) => String(o.status).toLowerCase() === s);
    }

    /* Búsqueda */
    if (q) {
      const text = String(q).toLowerCase();
      list = list.filter((o) => {
        const haystack = [
          o.number,
          o.id,
          o.userId,
          o.userName,
          o.userEmail,
        ]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
          .join(" ");

        return haystack.includes(text);
      });
    }

    /* Orden por fecha (más reciente primero) */
    list.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );

    const {
      items: pageItems,
      total,
      totalPages,
      page: pageInfo,
    } = paginate(list, { page, limit });

    const items = pageItems.map(buildMockOrderView);

    return {
      items,
      total,
      totalPages,
      page: pageInfo,
    };
  },

  async getById(id) {
    if (!id) throw new Error("order id is required");

    await delay();

    const strId = String(id);
    const found =
      ordersDb.orders.find(
        (o) => String(o.id) === strId || String(o.number) === strId
      ) ?? null;

    if (!found) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    return buildMockOrderView(found);
  },

  async cancel(id) {
    if (!id) throw new Error("order id is required");

    await delay();

    const idx = ordersDb.orders.findIndex(
      (o) => String(o.id) === String(id) || String(o.number) === String(id),
    );

    if (idx === -1) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    const updated = {
      ...ordersDb.orders[idx],
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    ordersDb.orders[idx] = updated;

    return buildMockOrderView(updated);
  },

  async updateStatus(id, status) {
    if (!id) throw new Error("order id is required");
    if (!status) throw new Error("status is required");

    await delay();

    const idx = ordersDb.orders.findIndex(
      (o) => String(o.id) === String(id) || String(o.number) === String(id),
    );

    if (idx === -1) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    const updated = {
      ...ordersDb.orders[idx],
      status,
      updatedAt: new Date().toISOString(),
    };

    ordersDb.orders[idx] = updated;

    return buildMockOrderView(updated);
  },

};

/* Remote implementation --------------------------------------------------------------------------------------------- */

const remoteOrdersApi = {
  async list(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(
      `${API_PATHS.admin.orders}${query}`
    );

    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items = rawItems.map((o) => normalizeOrder(o, o));

    return {
      items,
      total: data.total ?? items.length,
      totalPages: data.totalPages ?? 1,
      page: data.page ?? null,
    };
  },

  async getById(id) {
    if (!id) throw new Error("order id is required");

    const data = await apiClient.get(
      `${API_PATHS.admin.orders}/${id}`
    );

    return normalizeOrder(data, data);
  },

  async cancel(id) {
    if (!id) throw new Error("order id is required");

    const data = await apiClient.post(
      `${API_PATHS.admin.orders}/${id}/cancel`,
    );

    return data ? normalizeOrder(data, data) : null;
  },

  async updateStatus(id, updates = {}) {
    if (!id) throw new Error("order id is required");
    const status = updates?.status;
    if (!status) throw new Error("status is required");

    const payload = await apiClient.patch(
      `${API_PATHS.admin.orders}/${id}/estado`,
      { estado_envio: status }
    );

    const orderData = payload?.data ?? payload;
    return orderData ? normalizeOrder(orderData, orderData) : null;
  },

};

/* Export ------------------------------------------------------------------------------------------------------------ */

export const ordersApi = env.USE_MOCKS ? mockOrdersApi : remoteOrdersApi;
