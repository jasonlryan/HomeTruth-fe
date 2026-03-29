import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateName = () => {
      const name = localStorage.getItem("user_name");
      if (name) setUserName(name);
    };

    window.addEventListener("profileUpdated", updateName);
    updateName(); // set initial name on mount

    return () => window.removeEventListener("profileUpdated", updateName);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };


  return (
    <div className="flex items-center justify-between px-5 py-2 bg-white border-b relative">
      <div className="text-darkGrey text-base font-medium">Hi, {userName}!</div>
      <div className="flex items-center gap-4 min-h-[2.25rem]">
        <div className="relative flex items-center justify-center h-9" ref={dropdownRef}>
          <span
            className="material-symbols-outlined text-lightGrey cursor-pointer hover:text-primary transition !text-[20px] inline-flex items-center justify-center"
            onClick={toggleNotificationDropdown}
            title="Notifications"
          >
            notifications
          </span>

          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-8 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">notifications_none</span>
                  <p className="text-sm">No notifications</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => navigate("/settings/notifications")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-600 hover:text-gray-800 px-3 h-9 rounded-md hover:bg-gray-100 transition uppercase tracking-wider font-semibold flex items-center justify-center"
        >
          Logout
        </button>

        <button
          disabled
          title="Pro tier launching soon."
          className="bg-gray-400 text-white px-3 h-9 rounded-md text-xs opacity-60 cursor-not-allowed font-medium flex items-center justify-center"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
