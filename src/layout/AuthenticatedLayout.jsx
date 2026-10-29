import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import JourneyReturn from "../features/journey/JourneyReturn";
import { useAuth } from "../context/AuthContext";
import { recordPilotDailyActivity } from "../api/api";

const pilotActivityStorageKey = (userId) =>
  `hometruth:pilot-activity:${userId}:${new Date().toISOString().slice(0, 10)}`;

export default function AuthenticatedLayout() {
  const { user } = useAuth();
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

  // Check if user is admin
  const userRole = user?.role || localStorage.getItem("user_role");
  const isAdmin = userRole === "admin";

  // Normal chrome layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1 min-w-0">
        {!isAdmin && <Sidebar />}
        <div className="flex-1 min-w-0 flex flex-col">
          {!isAdmin && <Topbar />}
          {!isAdmin && <JourneyReturn />}
          <main className="flex-1 min-w-0 relative">
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
