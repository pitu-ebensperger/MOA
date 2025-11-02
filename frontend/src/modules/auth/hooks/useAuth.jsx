import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth as useAuthCtx } from "../context/AuthContext.jsx";

export const useAuth = () => useAuthCtx();


export function ProtectedRoute() {
  const { isAuthenticated } = useAuthCtx();
  const location = useLocation();
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}


export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthCtx();
  const location = useLocation();
  return isAuthenticated && isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}
