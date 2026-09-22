import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({
  isAuthenticated,
  allowedRoles = [],
  user,
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}   