import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Variantes ------------------------------------------------------------
const VARIANTS = {
  primary:
    "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-300",
  secondary:
    "bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-300",
  ghost:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-300",
  link:
    "bg-transparent text-emerald-700 hover:underline shadow-none focus-visible:ring-emerald-300 px-0",
};

// Tamaños --------------------------------------------------------------
const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

// Spinners --------------------------------------------------------------
const SPINNER = {
  primary: "border-white/50 border-t-white",
  secondary: "border-white/50 border-t-white",
  ghost: "border-slate-900/30 border-t-slate-900",
  link: "border-emerald-700/30 border-t-emerald-700",
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
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl",
    "shadow-sm outline-none select-none transition-all",
    "focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-60 disabled:pointer-events-none",
    VARIANTS[variant] || VARIANTS.primary,
    variant === "link" ? "px-0 h-auto" : (SIZES[size] || SIZES.md),
    fullWidth && "w-full",
    isLoading && "cursor-default",
    className
  );

  const content = (
    <>
      {isLoading && (   // btn con loading spinner
        <span
            className={cn("size-4 border-2 rounded-full animate-spin", SPINNER[variant])}
            aria-hidden="true"
            />
      )}
      {!isLoading && leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className="truncate">
        <span aria-live="polite" aria-atomic="true">
          {isLoading ? "Procesando…" : children}
        </span>
      </span>
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
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

Button.propTypes = {  
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "ghost", "link"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  to: PropTypes.string,
  href: PropTypes.string,
  target: PropTypes.string,
  rel: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
