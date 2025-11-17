import { createStrictContext } from "@/context/createStrictContext.js"

// Context aislado de componentes para cumplir la regla react-refresh/only-export-components
export const [AuthContext, useAuth] = createStrictContext("Auth", {
  displayName: "AuthContext",
  errorMessage: "useAuth debe usarse dentro de AuthProvider",
});

const normalizeRoleValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : ""

const ADMIN_ROLE_ALIASES = new Set(["admin", "administrador"])
const DEMO_ADMIN_EMAILS = new Set(["demo@moa.cl", "demo@moal.cl"]);

// Utilidad: detectar rol admin con tolerancia a cambios de backend
export const isAdminRole = (user) => {
  if (!user) return false;
  const emailValue = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (emailValue && DEMO_ADMIN_EMAILS.has(emailValue)) {
    return true;
  }
  return [user?.role, user?.rol, user?.role_code, user?.rol_code]
    .map(normalizeRoleValue)
    .some((value) => ADMIN_ROLE_ALIASES.has(value));
};
