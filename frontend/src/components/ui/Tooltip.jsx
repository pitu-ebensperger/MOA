import React from "react";
import ReactDOM from "react-dom";
import { cx } from "@/utils/ui-helpers.js"


const VARIANT_CLASSES = {
  neutral: "bg-[color:var(--color-dark)] text-[color:var(--color-text-on-dark)]",
  primary: "bg-[color:var(--color-primary1)] text-[color:var(--color-lightest2)]",
  soft: "bg-[color:var(--color-neutral4)] text-[color:var(--color-text)]", 
};

export function Tooltip({
  label,           
  children,  
  position = "right", 
  variant = "neutral", 
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);

  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral;
  const tooltipId = React.useId();
  const isValidElement = React.isValidElement(children);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    const arrowSize = 6; // Tamaño de la flecha
    const offset = 12; // Distancia entre el trigger y el tooltip

    switch (position) {
      case "top":
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case "right":
      default:
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
    }

    setCoords({ top, left });
  }, [position]);

  const handleMouseEnter = React.useCallback(() => {
    setIsVisible(true);
    updatePosition();
  }, [updatePosition]);

  const handleMouseLeave = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleFocus = React.useCallback(() => {
    setIsVisible(true);
    updatePosition();
  }, [updatePosition]);

  const handleBlur = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  const trigger = isValidElement
    ? React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        "aria-describedby": cx(children.props?.["aria-describedby"], tooltipId),
      })
    : children;

  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0 border-[6px] border-solid";
    const variantBorder = variant === "primary" 
      ? "border-[color:var(--color-primary1)]"
      : variant === "soft"
      ? "border-[color:var(--color-neutral4)]"
      : "border-[color:var(--color-dark)]";

    switch (position) {
      case "top":
        return cx(
          baseClasses,
          variantBorder,
          "border-t-[color:inherit] border-r-transparent border-b-transparent border-l-transparent",
          "top-full left-1/2 -translate-x-1/2"
        );
      case "bottom":
        return cx(
          baseClasses,
          variantBorder,
          "border-b-[color:inherit] border-t-transparent border-r-transparent border-l-transparent",
          "bottom-full left-1/2 -translate-x-1/2"
        );
      case "left":
        return cx(
          baseClasses,
          variantBorder,
          "border-l-[color:inherit] border-t-transparent border-r-transparent border-b-transparent",
          "left-full top-1/2 -translate-y-1/2"
        );
      case "right":
      default:
        return cx(
          baseClasses,
          variantBorder,
          "border-r-[color:inherit] border-t-transparent border-l-transparent border-b-transparent",
          "right-full top-1/2 -translate-y-1/2"
        );
    }
  };

  const tooltipContent = isVisible && typeof document !== "undefined" ? ReactDOM.createPortal(
    <span
      id={tooltipId}
      role="tooltip"
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: position === "top" || position === "bottom" 
          ? "translate(-50%, -100%)" 
          : position === "left" 
          ? "translate(-100%, -50%)" 
          : "translateY(-50%)",
      }}
      className={cx(
        "pointer-events-none z-(--z-tooltip) whitespace-nowrap relative",
        "rounded-md px-3 py-2 text-[0.75rem] leading-snug shadow-lg",
        "opacity-0 invisible",
        "transition-all duration-150 ease-out",
        isVisible && "opacity-100 visible",
        variantClass,
      )}
    >
      {label}
      <span className={getArrowClasses()} />
    </span>,
    document.body
  ) : null;

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
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
