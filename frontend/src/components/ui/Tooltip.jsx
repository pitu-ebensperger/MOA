import React from "react";
import { cx } from "../../utils/ui-helpers.js";


const POSITION_CLASSES = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

const VARIANT_CLASSES = {
  neutral: "bg-[color:var(--color-dark)] text-[color:var(--color-text-on-dark)]",
  primary: "bg-[color:var(--color-primary1)] text-[color:var(--color-lightest2)]",
  soft: "bg-[color:var(--color-neutral4)] text-[color:var(--color-text)]", 
};

export function Tooltip({
  label,           
  children,  
  position = "top", 
  variant = "neutral", 
}) {

    const positionClass = POSITION_CLASSES[position] ?? POSITION_CLASSES.top;
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral;

  const tooltipId = React.useId();
  const isValidElement = React.isValidElement(children);

  const trigger = isValidElement
    ? React.cloneElement(children, {
        "aria-describedby": cx(children.props?.["aria-describedby"], tooltipId),
      })
    : children;

  return (
    <span
      className="relative inline-flex group"
    >
      {/* Elemento que dispara el tooltip */}
      <span className="inline-flex">
        {trigger}
      </span>

      {/* Capa del tooltip */}
      <span
        id={tooltipId}
        role="tooltip"
        className={cx(
          // layout container
          "pointer-events-none absolute z-[var(--z-tooltip)] whitespace-nowrap",
          "rounded-md px-3 py-2 text-[0.75rem] leading-snug shadow-sm",

          // animación de entrada / salida
          "opacity-0 invisible translate-y-1",
          "transition-all duration-150 ease-out",
          "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0",
          "group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0",

          // variantes visuales
          variantClass,

          // posición
          positionClass,
        )}
      >
        {label}
      </span>
    </span>
  );
}


export const TooltipNeutral = (props) => (
  <Tooltip {...props} variant="neutral" />
);

export const TooltipPrimary = (props) => (
  <Tooltip {...props} variant="primary" />
);

export const TooltipSoft = (props) => (
  <Tooltip {...props} variant="soft" />
);
