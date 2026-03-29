// src/components/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Prevent access to public routes when logged in
  return user ? <Navigate to="/dashboard" replace /> : children;
}
