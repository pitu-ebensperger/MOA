import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X } from "@icons/lucide";
import { cx } from "@/utils/ui-helpers.js";

/**
 * Modal Component - Sistema unificado de modales
 * 
 * Diseñado para mantener consistencia visual con Alert, Toast y ConfirmDialog
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  placement = "center",
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  bodyClassName,
  footer,
  footerClassName,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setIsExiting(false);
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnOverlayClick) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeOnOverlayClick]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
      setIsExiting(false);
    }, 200);
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleClose();
    }
  };

  const handlePanelClick = (event) => event.stopPropagation();

  if (!open && !isExiting) return null;

  const containerClass = cx(
    "fixed inset-0 z-[var(--z-modal)] flex p-4",
    placement === "right" ? "items-stretch justify-end" : "items-center justify-center"
  );

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full",
  };

  const panelClasses = cx(
    "relative bg-white w-full",
    "transition-all duration-300 ease-out",
    placement === "right"
      ? cx(
          "h-full max-w-[520px]",
          isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        )
      : cx(
          "rounded-[var(--radius-xl)] shadow-2xl",
          sizeClasses[size] || sizeClasses.md,
          isExiting
            ? "scale-95 translate-y-4 opacity-0"
            : "scale-100 translate-y-0 opacity-100"
        ),
    className
  );

  return (
    <div className={containerClass} aria-modal="true" role="dialog">
      {/* Overlay */}
      <div
        className={cx(
          "absolute inset-0 bg-[color:var(--overlay-dark)] transition-opacity duration-200",
          isExiting ? "opacity-0" : "opacity-100"
        )}
        onClick={handleOverlayClick}
      />

      {/* Panel */}
      <div ref={panelRef} className={panelClasses} onClick={handlePanelClick}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cx(
              "flex items-center justify-between gap-4",
              "px-6 py-4 border-b border-[color:var(--color-border)]",
              headerClassName
            )}
          >
            <div className="min-w-0 flex-1">
              {typeof title === "string" ? (
                <h2 className="text-lg font-semibold text-[color:var(--color-text)] truncate">
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className={cx(
                  "shrink-0 p-2 rounded-full",
                  "text-[color:var(--color-text-secondary)]",
                  "hover:bg-[color:var(--color-neutral3)]/30",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary1)]/40"
                )}
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={cx(
            "overflow-y-auto",
            placement === "right"
              ? "h-[calc(100%-80px)]"
              : "max-h-[calc(100vh-12rem)]",
            "px-6 py-4",
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cx(
              "px-6 py-4 border-t border-[color:var(--color-border)]",
              "flex items-center justify-end gap-3",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  placement: PropTypes.oneOf(["center", "right"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
};
