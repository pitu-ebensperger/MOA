import React, { forwardRef } from "react";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" "); 

// Variantes ------------------------------------------------------------
const VARIANTS = {
  primary: "btn-primary",
  "primary-round": "btn-primary btn-primary-round",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  bare: "btn-bare",
  round: "btn-round",
  link: "btn-link",
  animated: "btn-animated",
  "card-solid": "btn-card-solid",
  "card-outline": "btn-card-outline",
  "cta-home": "btn-cta-home",
  icon: "btn-icon",
  "icon-bg": "btn-icon-bg",
};

const SIZES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const ICON_POSITIONS = {
  left: "btn-icon-left",
  right: "btn-icon-right",
};

const ICON_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",  
}


// 

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled = false,
      to, // Link interno <Link to="/ruta" />
      href, // Link externo <a href="https://..." />
      target,
      rel,
      type = "button",
      leftIcon,
      rightIcon,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    // estado unificado de deshabilitado
    const isDisabled = isLoading || disabled;

    // clases base del botón
    const classes = cn(
      "btn",
      VARIANTS[variant] || VARIANTS.primary,
      SIZES[size] || SIZES.md,
      fullWidth && "btn-block",
      isLoading && "is-loading",
      isDisabled && "btn-disabled",
      className
    );

    // contenido del botón (texto + iconos + loading)
    const content = (
      <>
        {isLoading && (             // spinner visual, oculto para lectores de pantalla
          <span className="btn-spinner" aria-hidden="true" />
        )}

        {!isLoading && leftIcon ? (
          <span className="btn-icon">{leftIcon}</span>
        ) : null}

        {/* región que anuncia cambios de texto (Procesando...) */}
        <span aria-live="polite" aria-atomic="true" role={isLoading ? "status" : undefined}>
          {isLoading ? "Procesando…" : children}
        </span>

        {!isLoading && rightIcon ? (
          <span className="btn-icon">{rightIcon}</span>
        ) : null}
      </>
    );

    // handler para bloquear clicks cuando está deshabilitado
    const handleClick = (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (onClick) {
        onClick(event);
      }
    };

    // Props comunes para links/botones
    const baseProps = {
      ref,
      className: classes,
      "aria-disabled": isDisabled || undefined,
      onClick: handleClick,
      ...rest,
    };

    // Link interno (react-router)
    if (to) {
      return (
        <Link
          to={to}
          // si quieres evitar foco cuando está deshabilitado:
          tabIndex={isDisabled ? -1 : undefined}
          {...baseProps}
        >
          {content}
        </Link>
      );
    }

    // Link externo <a>
    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          tabIndex={isDisabled ? -1 : undefined}
          {...baseProps}
        >
          {content}
        </a>
      );
    }

    // Botón nativo
    return (
      <button
        type={type}
        className={classes}
        disabled={isDisabled} // deshabilita a nivel nativo
        aria-busy={isLoading || undefined}
        ref={ref}
        onClick={handleClick}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

export default Button;
