import { useAuth } from '../context/AuthContext';
import { isDemoWorkspaceUser } from '../utils/demoHomeHistory';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, House, MessageCircle, NotebookPen, Files, Calculator,
  Settings, UserRound, SlidersHorizontal, Bell, LockKeyhole, KeyRound,
  PanelsTopLeft, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { getPartnerProgrammeAccessStatus } from '../api/api';
import './sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1024);
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/settings'));
  const [hasPartnerAccess, setHasPartnerAccess] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => { setNarrow(media.matches); setCollapsed(media.matches); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { setSettingsOpen(location.pathname.startsWith('/settings')); }, [location.pathname]);
  useEffect(() => {
    let cancelled = false;
    getPartnerProgrammeAccessStatus().then(value => { if (!cancelled) setHasPartnerAccess(value); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const go = path => { navigate(path); if (narrow) setCollapsed(true); };
  const item = (Icon, label, path, active = location.pathname === path) => (
    <NavItem key={path} icon={<Icon size={24} strokeWidth={1.75} />} label={label}
      collapsed={collapsed} active={active} onClick={() => go(path)} />
  );
  const handleKeys = event => {
    if (!narrow || collapsed) return;
    if (event.key === 'Escape') { setCollapsed(true); event.currentTarget.querySelector('[data-nav-toggle]').focus(); }
    if (event.key === 'Tab') {
      const controls = [...event.currentTarget.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };
  return <div className="ht-sidebar-shell" data-collapsed={collapsed}>
    {narrow && !collapsed && <button type="button" className="ht-sidebar-backdrop" tabIndex={-1} aria-label="Close navigation" onClick={event => { const toggle = event.currentTarget.parentElement.querySelector('[data-nav-toggle]'); setCollapsed(true); toggle.focus(); }} />}
    <aside className="ht-sidebar" onKeyDown={handleKeys} role={narrow && !collapsed ? 'dialog' : undefined}
      aria-modal={narrow && !collapsed ? 'true' : undefined} aria-label="HomeTruth navigation">
      <a href="/dashboard" className="ht-sidebar-brand" aria-label="HomeTruth dashboard" title="HomeTruth dashboard">
        <img src={collapsed ? "/assets/brand/hometruth-icon.svg" : "/assets/brand/hometruth-logo.svg"} alt="" width={collapsed ? 32 : 220} height={collapsed ? 32 : 42} />
      </a>
      <button type="button" data-nav-toggle className="ht-nav-item ht-nav-toggle" aria-expanded={!collapsed}
        aria-controls="home-navigation" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        title={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(value => !value)}>
        {collapsed ? <PanelLeftOpen size={24} strokeWidth={1.75} /> : <PanelLeftClose size={24} strokeWidth={1.75} />}
        {!collapsed && <span>Collapse navigation</span>}
      </button>
      <nav id="home-navigation" aria-label="Main navigation" className="ht-sidebar-items">
        {isDemoWorkspaceUser(user?.email) && item(PanelsTopLeft, 'Operations', '/operations')}
        {item(LayoutDashboard, 'Dashboard', '/dashboard')}
        {hasPartnerAccess && item(KeyRound, 'Partner programmes', '/partner-programmes')}
        {item(House, 'Property profile', '/property-profile')}
        {item(MessageCircle, 'Ask HomeTruth', '/ask-ai')}
        {item(NotebookPen, 'Notes', '/saved-notes')}
        {item(Calculator, 'Budget Calculator', '/budget-chat', location.pathname.startsWith('/budget'))}
        {item(Files, 'Documents', '/documents')}
        <NavItem icon={<Settings size={24} strokeWidth={1.75} />} label="Settings" collapsed={collapsed}
          active={location.pathname.startsWith('/settings')} expanded={settingsOpen} controls="settings-navigation"
          onClick={() => setSettingsOpen(value => !value)} />
        {settingsOpen && <div id="settings-navigation" className="ht-sidebar-settings">
          {item(UserRound, 'Account', '/settings/account')}
          {item(SlidersHorizontal, 'Preferences', '/settings/preferences')}
          {item(Bell, 'Notifications', '/settings/notifications')}
          {item(LockKeyhole, 'Data Privacy', '/settings/data-privacy')}
        </div>}
      </nav>
    </aside>
  </div>;
}

function NavItem({ icon, label, active, onClick, collapsed, expanded, controls }) {
  return <button type="button" aria-label={label} title={collapsed ? label : undefined}
    aria-current={active && expanded === undefined ? 'page' : undefined}
    aria-expanded={expanded} aria-controls={controls} onClick={onClick}
    className={`ht-nav-item ${active ? 'ht-nav-active' : ''}`}>
    <span className="shrink-0" aria-hidden="true">{icon}</span>
    <span className={collapsed ? 'ht-nav-tooltip' : ''} aria-hidden={collapsed ? 'true' : undefined}>{label}</span>
  </button>;
}
