// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { pathname, search } = useLocation();

  if (loading) return null;

  if (user) return children || <Outlet />;

  const loginPath = pathname === "/control-centre"
    ? "/login?" + new URLSearchParams({ redirect: pathname + search }).toString()
    : "/login";
  return <Navigate to={loginPath} replace />;
}
