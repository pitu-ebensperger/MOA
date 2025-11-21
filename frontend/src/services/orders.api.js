import { API_PATHS } from "@/config/api-paths.js"
import { apiClient } from "@/services/api-client.js"
import { buildQueryString } from "@/utils/https.js"
import { toNum } from "@/utils/number.js"
import { paginate } from "@/utils/pagination.js"



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

export const ordersApi = remoteOrdersApi;
