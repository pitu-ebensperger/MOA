import clsx from "clsx";

const VARIANTS = {
  primary: "bg-[#d1ab84] text-white",
  secondary: "bg-[#1f1f1f] text-white",
  neutral: "bg-white text-[#443114]",
};

function Badge({ children, variant = "primary", className, ...props }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-[15.768px] px-[9.523px] py-[1.587px] text-[7.935px] font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[11.13px] tracking-[1.5871px] uppercase",
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
