import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  isAuthenticated,
  allowedRoles = [],
  user,
}) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}   