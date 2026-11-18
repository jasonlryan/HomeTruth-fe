import { useAuth } from '../context/AuthContext';
import { isDemoWorkspaceUser } from '../utils/demoHomeHistory';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Search,
  FileText,
  File,
  Calculator,
  Settings,
  User,
  Sliders,
  Bell,
  Lock,
  KeyRound,
} from "lucide-react";
import { getPartnerProgrammeAccessStatus } from "../api/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings")
  );
  const [hasPartnerAccess, setHasPartnerAccess] = useState(false);

  useEffect(() => {
    setSettingsOpen(location.pathname.startsWith("/settings"));
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    getPartnerProgrammeAccessStatus()
      .then((hasAccess) => {
        if (!cancelled) setHasPartnerAccess(hasAccess);
      })
      .catch(() => {
        if (!cancelled) setHasPartnerAccess(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="hidden w-80 bg-white border-r p-4 lg:flex lg:flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <img 
          src="/assets/logo.png" 
          alt="Home logo" 
          className="w-45 h-12 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <nav className="space-y-2 text-sm text-gray-700">
        {isDemoWorkspaceUser(user?.email) && <NavItem icon={<Building2 size={20} />} label="Operations" onClick={() => navigate('/operations')} active={location.pathname === '/operations'} />}
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
          onClick={() => navigate("/dashboard")}
          active={location.pathname === "/dashboard"}
        />
        {hasPartnerAccess && (
          <NavItem
            icon={<KeyRound size={20} />}
            label="Partner programmes"
            onClick={() => navigate("/partner-programmes")}
            active={location.pathname === "/partner-programmes"}
          />
        )}
        <NavItem
          icon={<Building2 size={20} />}
          label="Property profile"
          onClick={() => navigate("/property-profile")}
          active={location.pathname === "/property-profile"}
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
    <button type="button" aria-current={active ? "page" : undefined} onClick={onClick}
      className={`flex w-full items-center rounded-[var(--radius-md)] px-4 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] ${active ? "bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface-default))] text-[var(--color-text-default)] font-medium" : "hover:bg-gray-100"}`}>
      <span className="mr-2" aria-hidden="true">{icon}</span><span>{label}</span>
    </button>
  );
}

function SubNavItem({ icon, label, active, onClick }) {
  return <NavItem icon={icon} label={label} active={active} onClick={onClick} />;
}
