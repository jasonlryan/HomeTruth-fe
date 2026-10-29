// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return user ? (children || <Outlet />) : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}
