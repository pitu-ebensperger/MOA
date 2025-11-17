import { customersDb } from "../../../frontend/src/mocks/database/customers.js";

const normalizeName = (firstName, lastName) =>
  [firstName, lastName].filter(Boolean).join(" ").trim();

export const CUSTOMERS = customersDb.users.map((user) => ({
  publicId: user.id,
  nombre: normalizeName(user.firstName, user.lastName) || user.username || "Cliente MOA",
  email: user.email?.toLowerCase() ?? "",
  telefono: user.phone ?? null,
  estado: user.status ?? "active",
  creadoEn: user.createdAt ?? null,
}));
