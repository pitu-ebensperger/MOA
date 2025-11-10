import React from "react";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Variantes ------------------------------------------------------------
const VARIANTS = {
  primary: "btn-primary",
  "primary-round": "btn-primary btn-primary-round",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "btn-link",
  animated: "btn-animated",
  "card-solid": "btn-card-solid",
  "card-outline": "btn-card-outline",
  "cta-home": "btn-cta-home",
};

// Tamaños --------------------------------------------------------------
const SIZES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  to,          //Link interno <Link> -->  to="/perfil"
  href,        //Link externo <a> --> href="https://pagina.com"
  target,
  rel,
  type = "button",
  leftIcon,
  rightIcon,
  className,
  onClick,
  ...rest
}) {

  const classes = cn(     
    "btn",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth && "btn-block",
    isLoading && "is-loading",
    className
  );

  const content = (
    <>
      {isLoading && (   // btn con loading spinner
        <span className="btn-spinner" aria-hidden="true" />
      )}
      {!isLoading && leftIcon ? <span className="btn-icon">{leftIcon}</span> : null}
      <span aria-live="polite" aria-atomic="true">
        {isLoading ? "Procesando…" : children}
      </span>
      {!isLoading && rightIcon ? <span className="btn-icon">{rightIcon}</span> : null}
    </>
  );


  if (to) {    //Link interno (router) <Link>
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={isLoading || disabled}
        onClick={isLoading || disabled ? (e) => e.preventDefault() : onClick}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {    
    return (
      <a
        href={href}
        target={target}
        rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
        className={classes}
        aria-disabled={isLoading || disabled}
        onClick={isLoading || disabled ? (e) => e.preventDefault() : onClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

 
  return (
    <button
      type={type}
      className={classes}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}


export default Button;
