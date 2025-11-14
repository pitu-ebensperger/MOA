import clsx from "clsx";

const VARIANTS = {
  primary: "bg-[#d1ab84] text-white",
  secondary: "border-white text-white",
  neutral: "bg-white text-[#443114]",
  destacado: "bg-[#d1ab84] text-white",
  nuevo: "bg-[#d1ab84] text-white",
};

function Badge({ children, variant = "primary", className, ...props }) {
  return (
    <span
      className={clsx(
        "w-fit inline-flex items-center justify-center rounded-3xl px-[9.523px] py-1 text-xs font-sans font-medium leading-[11.13px] tracking-[1.5871px] uppercase",
        VARIANTS[variant] ?? VARIANTS.primary,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
