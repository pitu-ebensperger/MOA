import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth as useAuthCtx } from "../../../context/AuthContext.jsx";
import { API_PATHS } from "../../../config/api-paths.js";

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useAuthCtx();


export function ProtectedRoute() {
  const { isAuthenticated } = useAuthCtx();
  const location = useLocation();

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={API_PATHS.auth.login} replace state={{ from: location }} />
  );
}

export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthCtx();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={API_PATHS.auth.login} replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
