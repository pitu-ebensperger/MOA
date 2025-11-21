import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "@icons/lucide";
import { cx } from "@/utils/ui-helpers.js";

/* Toast System -------------------------------------------------------------------------- */

class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  show(toast) {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  dismiss(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  dismissAll() {
    this.toasts = [];
    this.notify();
  }
}

const toastManager = new ToastManager();

/* Toast Component -------------------------------------------------------------------------- */

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle,
    bgClass: "bg-[color:var(--color-success)]",
    borderClass: "border-[color:var(--color-success)]",
    textClass: "text-white",
    iconClass: "text-white",
  },
  error: {
    icon: XCircle,
    bgClass: "bg-[color:var(--color-error)]",
    borderClass: "border-[color:var(--color-error)]",
    textClass: "text-white",
    iconClass: "text-white",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-[color:var(--color-warning)]",
    borderClass: "border-[color:var(--color-warning)]",
    textClass: "text-white",
    iconClass: "text-white",
  },
  info: {
    icon: Info,
    bgClass: "bg-[color:var(--color-secondary2)]",
    borderClass: "border-[color:var(--color-secondary2)]",
    textClass: "text-white",
    iconClass: "text-white",
  },
};

function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const config = VARIANT_CONFIG[toast.variant] || VARIANT_CONFIG.info;
  const IconComponent = toast.icon || config.icon;

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  return (
    <div
      className={cx(
        "flex items-start gap-3 min-w-[320px] max-w-md",
        "p-4 rounded-[var(--radius-lg)]",
        "border shadow-lg",
        config.bgClass,
        config.borderClass,
        "transition-all duration-300",
        isExiting
          ? "opacity-0 translate-x-full"
          : "opacity-100 translate-x-0 animate-slide-in-right"
      )}
      role="alert"
    >
      {/* Ícono */}
      {IconComponent && (
        <div className={cx("shrink-0 mt-0.5", config.iconClass)}>
          <IconComponent className="w-5 h-5" />
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={cx("font-semibold text-sm mb-1", config.textClass)}>
            {toast.title}
          </h4>
        )}
        {toast.message && (
          <div className={cx("text-sm", config.textClass, "opacity-90")}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Botón de cerrar */}
      <button
        type="button"
        onClick={handleDismiss}
        className={cx(
          "shrink-0 p-1 rounded-md",
          "transition-colors duration-150",
          "hover:bg-white/20",
          config.iconClass
        )}
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* Toast Container -------------------------------------------------------------------------- */

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[var(--z-tooltip)] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={toastManager.dismiss.bind(toastManager)} />
        </div>
      ))}
    </div>,
    document.body
  );
}

/* Toast API -------------------------------------------------------------------------- */

export const toast = {
  success: (message, options = {}) => {
    return toastManager.show({
      variant: "success",
      message,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toastManager.show({
      variant: "error",
      message,
      duration: 4000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toastManager.show({
      variant: "warning",
      message,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toastManager.show({
      variant: "info",
      message,
      ...options,
    });
  },

  /**
   * Muestra un toast personalizado
   * @param {Object} options - { variant, title, message, duration, icon }
   */
  custom: (options) => {
    return toastManager.show(options);
  },

  //Cierra un toast específico
  dismiss: (id) => {
    toastManager.dismiss(id);
  },

  // Cierra todos los toasts 
  dismissAll: () => {
    toastManager.dismissAll();
  },
};

/* Hook useToast -------------------------------------------------------------------------- */

// Hook para usar toasts en componentes
export function useToast() {
  return {
    toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };
}
