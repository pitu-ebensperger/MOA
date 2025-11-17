import { customersDb } from "../../../frontend/src/mocks/database/customers.js";

const userPhoneMap = new Map(
  customersDb.users.map((user) => [user.id, user.phone ?? null])
);

export const ADDRESSES = customersDb.addresses.map((address) => ({
  externalId: address.id,
  userId: address.userId,
  etiqueta: address.label,
  calle: address.street,
  numero: null,
  deptoOficina: null,
  comuna: address.commune,
  ciudad: address.city,
  region: address.region,
  codigoPostal: address.postalCode,
  pais: address.country,
  telefono: userPhoneMap.get(address.userId) ?? null,
  instruccionesEntrega: address.instructions ?? null,
  esPredeterminada: address.isDefault ?? false,
}));
