import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context.js"
import { API_PATHS } from "@/config/api-paths.js"
import AdminUnauthorizedPage from "@/modules/support/pages/AdminUnauthorizedPage.jsx"


export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={API_PATHS.auth.login} replace state={{ from: location }} />
  );
}

export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <AdminUnauthorizedPage type="auth" state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <AdminUnauthorizedPage type="role" />;
  }

  return <Outlet />;
}
