import bcrypt from "bcryptjs";

export const DEFAULT_CUSTOMER_PASSWORD =
  process.env.DEFAULT_USER_PASSWORD || "ClienteMOA123!";

export const CUSTOMER_PASSWORD_HASH = bcrypt.hashSync(
  DEFAULT_CUSTOMER_PASSWORD,
  10
);
