import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function AuthenticatedLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [onboardingMode, setOnboardingMode] = useState(() => {
    // Check if user is admin - admins never enter onboarding mode
    const userRole = user?.role || localStorage.getItem("user_role");
    const isAdmin = userRole === "admin";
    
    if (isAdmin) {
      return false; // Admins always see the normal layout
    }

    const needsProfile = localStorage.getItem("require_profile") === "true";
    const isNewUser = localStorage.getItem("new_user") === "true";
    const isWelcomePage = location.pathname === "/welcome";
    const isQuizModalActive = localStorage.getItem("quiz_modal_active") === "true";
    const isOnboardingLocked = localStorage.getItem("onboarding_lock") === "true";
    const isAskAIPage = location.pathname === "/ask-ai";

    // Always show full layout on Ask AI page (e.g. after login/register redirect)
    if (isAskAIPage) return false;

    // Hide layout for onboarding (profile completion, new users, welcome page, quiz modal, onboarding lock)
    return needsProfile || isNewUser || isWelcomePage || isQuizModalActive || isOnboardingLocked;
  });

  useEffect(() => {
    // Check if user is admin - admins never enter onboarding mode
    const userRole = user?.role || localStorage.getItem("user_role");
    const isAdmin = userRole === "admin";
    
    if (isAdmin) {
      setOnboardingMode(false);
      return;
    }

    // Update when other tabs change localStorage
    const onStorage = () => {
      const needsProfile = localStorage.getItem("require_profile") === "true";
      const isNewUser = localStorage.getItem("new_user") === "true";
      const isWelcomePage = location.pathname === "/welcome";
      const isQuizModalActive = localStorage.getItem("quiz_modal_active") === "true";
      const isOnboardingLocked = localStorage.getItem("onboarding_lock") === "true";
      const isAskAIPage = location.pathname === "/ask-ai";

      if (isAskAIPage) {
        setOnboardingMode(false);
        return;
      }
      setOnboardingMode(needsProfile || isNewUser || isWelcomePage || isQuizModalActive || isOnboardingLocked);
    };
    window.addEventListener("storage", onStorage);

    // Same-tab updates don't trigger "storage", so poll lightly.
    const id = setInterval(onStorage, 300);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [location.pathname, user]);

  if (onboardingMode) {
    // Full white canvas; no chrome
    return (
      <div className="min-h-screen bg-white">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("user_role");
  const isAdmin = userRole === "admin";

  // Normal chrome layout
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div className="flex flex-1">
        {!isAdmin && <Sidebar />}
        <div className="flex-1 flex flex-col">
          {!isAdmin && <Topbar />}
          <main className="flex-1 relative">
            <Outlet />
          </main>
        </div>
      </div>
      {!isAdmin && (
        <div className="flex-shrink-0">
          <Footer />
        </div>
      )}
    </div>
  );
}
