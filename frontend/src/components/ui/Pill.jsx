import React from "react";
import clsx from "clsx";

// Variantes ---------------------------------------------------
const PILL_STYLES = {
  primary: "bg-(--color-primary1)/15 text-(--color-primary1) border-(--color-primary1)/30",
  success: "bg-(--color-success)/15 text-(--color-success) border-(--color-success)/30",
  warning: "bg-(--color-warning)/15 text-(--color-warning) border-(--color-warning)/30",
  error: "bg-(--color-error)/15 text-(--color-error) border-(--color-error)/30",
  info: "bg-(--color-info)/15 text-(--color-info) border-(--color-info)/30",
  neutral: "bg-(--color-border-subtle) text-(--text-secondary) border-(--color-border)", // > default
};

// Pill ---------------------------------------------------
export function Pill({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_STYLES[variant] ?? PILL_STYLES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Pill;
