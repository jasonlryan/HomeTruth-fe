import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  FileText,
  File,
  Calculator,
  Settings,
  User,
  Sliders,
  Bell,
  Lock,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings")
  );

  useEffect(() => {
    setSettingsOpen(location.pathname.startsWith("/settings"));
  }, [location.pathname]);

  return (
    <div className="w-80 bg-white border-r p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <img 
          src="/assets/logo.png" 
          alt="Home logo" 
          className="w-45 h-12 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <nav className="space-y-2 text-sm text-gray-700">
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
          onClick={() => navigate("/dashboard")}
          active={location.pathname === "/dashboard"}
        />
        <NavItem
          icon={<Search size={20} />}
          label="Ask HomeTruth"
          onClick={() => navigate("/ask-ai")}
          active={location.pathname === "/ask-ai"}
        />
        <NavItem
          icon={<FileText size={20} />}
          label="Notes"
          onClick={() => navigate("/saved-notes")}
          active={location.pathname === "/saved-notes"}
        />
       
        <NavItem
          icon={<Calculator size={20} />}
          label="Budget Calculator"
          onClick={() => navigate("/budget-chat")}
          active={["/budget", "/budget-history", "/budget-home", "/budget-calculator", "/budget-chat"].includes(
            location.pathname
          )}
        />
         <NavItem
          icon={<File size={20} />}
          label="Documents"
          onClick={() => navigate("/documents")}
          active={location.pathname === "/documents"}
        />

        {/* Settings & Preferences */}
        <div>
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            active={location.pathname.startsWith("/settings")}
          />

          {/* Submenu */}
          {settingsOpen && (
            <div className="ml-6 mt-2 space-y-1">
              <SubNavItem
                icon={<User size={16} />}
                label="Account"
                onClick={() => navigate("/settings/account")}
                active={location.pathname === "/settings/account"}
              />
              <SubNavItem
                icon={<Sliders size={16} />}
                label="Preferences"
                onClick={() => navigate("/settings/preferences")}
                active={location.pathname === "/settings/preferences"}
              />
              <SubNavItem
                icon={<Bell size={16} />}
                label="Notifications"
                onClick={() => navigate("/settings/notifications")}
                active={location.pathname === "/settings/notifications"}
              />
              <SubNavItem
                icon={<Lock size={16} />}
                label="Data Privacy"
                onClick={() => navigate("/settings/data-privacy")}
                active={location.pathname === "/settings/data-privacy"}
              />
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-4 rounded-lg cursor-pointer transition-colors duration-150 ${
        active
          ? "bg-customActive text-customActiveText font-medium"
          : "hover:bg-gray-100"
      }`}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

function SubNavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded cursor-pointer text-sm transition-colors duration-150 ${
        active
          ? "text-customActiveText font-medium bg-customActive"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
