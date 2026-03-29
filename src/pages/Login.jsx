import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, claimGuestSession } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams.get("redirect") || null;
  const guestSessionId = searchParams.get("guest_session_id") || sessionStorage.getItem("guest_session_id_redirect") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) return;

    try {
      // Regular user login
      const res = await loginUser({ email, password });

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;
      const userRole = user?.role;

      if (!token) throw new Error("Token not found in response.");

      login(token, user);

      if (userRole) {
        localStorage.setItem("user_role", userRole);
      }

      const { first_name, last_name } = user || {};
      if (first_name && last_name) {
        localStorage.setItem("user_name", `${first_name} ${last_name}`);
        // Don't override new_user flag - let it be determined by registration or previous state
      } else {
        localStorage.setItem("require_profile", "true");
      }
      localStorage.setItem("user_email", email);

      // Handle extension redirect if present
      const redirectUri = new URLSearchParams(window.location.search).get(
        "redirect_uri"
      );

      if (redirectUri?.startsWith("chrome-extension://")) {
        window.location.href = `${redirectUri}#access_token=${token}`;
        return;
      }

      // If admin login, redirect to knowledge base admin and skip all onboarding
      if (userRole === "admin") {
        // Clear any onboarding flags for admin
        localStorage.removeItem("require_profile");
        localStorage.removeItem("new_user");
        localStorage.removeItem("quiz_modal_active");
        localStorage.removeItem("onboarding_lock");
        localStorage.setItem("quiz_completed", "true");
        localStorage.setItem("quiz_checked_this_session", "true");
        navigate("/admin/knowledge-base", { replace: true });
        return;
      }

      // Guest session continuity: claim guest chat and redirect to Ask AI with conversation
      if (guestSessionId && (redirectTo === "/ask-ai" || redirectTo === "ask-ai")) {
        try {
          sessionStorage.removeItem("guest_session_id_redirect");
          const data = await claimGuestSession(guestSessionId);
          const conversation_id = data?.conversation_id;
          if (conversation_id) {
            try {
              sessionStorage.setItem("ask_ai_open_conversation_id", conversation_id);
            } catch (_) {}
          }
          navigate("/ask-ai", { replace: true, state: { conversationId: conversation_id } });
          return;
        } catch (claimErr) {
          console.warn("Claim guest session failed:", claimErr);
          navigate("/ask-ai", { replace: true });
          return;
        }
      }

      // Check if this is a new user
      const isNewUser = localStorage.getItem("new_user") === "true";
      
      if (isNewUser) {
        // Redirect new users to welcome page
        navigate("/welcome", { replace: true });
      } else {
        // Default behavior (normal login) - Dashboard will check for quiz completion
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setPasswordError("Invalid email or password.");
        return;
      }

      const serverMessage =
        err.response?.data?.message || err.message || "Login failed.";
      const field = err.response?.data?.field;
      if (field === "email") {
        setEmailError(serverMessage);
      } else if (field === "password") {
        setPasswordError(serverMessage);
      } else {
        setError(serverMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="flex items-center p-12">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src="/assets/logo.png" 
              alt="Home Truth Logo" 
              className="w-56 h-13"
            />
          </button>
         
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-96">
        <div className="w-full max-w-4xl">
          {/* Welcome Message with Decorative Elements */}
          <div className="text-center mb-12 relative">
            <div className="flex items-start justify-center mb-4">
              {/* Orange shape */}
              <img 
                src="/assets/orange.png" 
                alt="Orange decoration" 
                className="w-6 h-6 sm:w-8 sm:h-8 mt-2 sm:mt-0 -mr-2 sm:-mr-4"
              />
              
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-black">
                  WELCOME BACK TO
                </h2>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-black whitespace-nowrap">YOUR PERSONAL PROPERTY ASSISTANT</h2>
              </div>
              
              {/* Blue shape */}
              <img 
                src="/assets/blue.png" 
                alt="Blue decoration" 
                className="w-6 h-6 sm:w-8 sm:h-8 mt-8 sm:mt-16 -ml-2 sm:-ml-4"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email Input */}
            <div className="w-full">
              <label className="block text-black text-lg sm:text-xl mb-2">Email</label>
              <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-2 text-base sm:text-lg outline-none"
                  placeholder=""
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="w-full">
              <label className="block text-black text-lg sm:text-xl mb-2">Password</label>
              <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 pr-10 text-base sm:text-lg outline-none"
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 flex items-center justify-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-xl block">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Sign In Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-customActiveText hover:bg-sky-600 mt-8 text-white py-4 sm:py-6 md:py-8 px-8 sm:px-16 md:px-32 lg:px-44 rounded-2xl text-lg sm:text-xl md:text-2xl font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-12 sm:mt-16 md:mt-12  text-lg sm:text-xl md:text-2xl mb-20">
            <p className="text-gray-600">
              Don't Have an Account?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="font-bold text-black hover:text-blue-600 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
