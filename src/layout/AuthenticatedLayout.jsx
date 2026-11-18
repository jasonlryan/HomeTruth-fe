import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { recordPilotDailyActivity } from "../api/api";

const comingSoon = process.env.REACT_APP_COMING_SOON === "true";

const pilotActivityStorageKey = (userId) =>
  `hometruth:pilot-activity:${userId}:${new Date().toISOString().slice(0, 10)}`;

export default function AuthenticatedLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const showProductNavigation = !comingSoon || !location.pathname.startsWith("/admin/");
  const [onboardingMode, setOnboardingMode] = useState(() => {
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

  useEffect(() => {
    if (!user?.id) return undefined;

    const storageKey = pilotActivityStorageKey(user.id);
    if (sessionStorage.getItem(storageKey)) return undefined;

    let cancelled = false;
    recordPilotDailyActivity()
      .then(() => {
        if (!cancelled) sessionStorage.setItem(storageKey, "recorded");
      })
      .catch(() => {
        // Analytics must not block the signed-in product experience.
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  // Normal chrome layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1 min-w-0">
        {showProductNavigation && <Sidebar />}
        <div className="flex-1 min-w-0 flex flex-col">
          {showProductNavigation && <Topbar />}
          <main className="flex-1 min-w-0 relative">
            <Outlet />
          </main>
        </div>
      </div>
      {showProductNavigation && (
        <div className="flex-shrink-0">
          <Footer />
        </div>
      )}
    </div>
  );
}
