import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // your existing axios instance

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await api.post("/api/auth/forgot-password", { email });
      setMessage("Password reset instructions sent. Check your email.");
    } catch (err) {
      console.error("Reset failed:", err);
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow bg-white">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-purple-700 text-white py-2 rounded"
          >
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm text-gray-600 underline mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
