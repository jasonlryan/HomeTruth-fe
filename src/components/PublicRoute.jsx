// src/components/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children, allowAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (allowAdmin && user?.role === "admin") return children;

  return user ? <Navigate to="/dashboard" replace /> : children;
}
