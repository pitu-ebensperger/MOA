import { formatCurrencyCLP } from "../../../utils/currency.js";

export const Price = ({ value, currency = "CLP", className = "" }) => {
  const formatted =
    currency === "CLP" ? formatCurrencyCLP(value) : new Intl.NumberFormat().format(value);

  return <span className={["price", className].filter(Boolean).join(" ")}>{formatted}</span>;
};