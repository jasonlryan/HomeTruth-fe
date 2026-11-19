import HTGlyph from "./HTGlyph";
import { localManualAskEnabled } from "../features/items/manualAskContext";
import { useAuth } from '../context/AuthContext';
import { isDemoWorkspaceUser } from '../utils/demoHomeHistory';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HTIcon } from "./homepage/HomeTruth";
import { getPartnerProgrammeAccessStatus } from '../api/api';
import './sidebar.css';

const iconBase = process.env.PUBLIC_URL + '/assets/brand/';

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
  const item = (icon, label, path, active = location.pathname === path) => (
    <NavItem key={path} icon={icon} label={label}
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
    <aside className="ht-sidebar ht-ui" onKeyDown={handleKeys} role={narrow && !collapsed ? 'dialog' : undefined}
      aria-modal={narrow && !collapsed ? 'true' : undefined} aria-label="HomeTruth navigation">
      <a href="/dashboard" className="ht-sidebar-brand" aria-label="HomeTruth dashboard" title="HomeTruth dashboard">
        <img src={collapsed ? "/assets/brand/hometruth-icon.svg" : "/assets/brand/hometruth-logo.svg"} alt="" width={collapsed ? 32 : 220} height={collapsed ? 32 : 42} />
      </a>
      <button type="button" data-nav-toggle className="ht-nav-item ht-nav-toggle" aria-expanded={!collapsed}
        aria-controls="home-navigation" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        title={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(value => !value)}>
        <HTIcon name={collapsed ? "expand" : "collapse"} size={24} assetBase={iconBase} />
        {!collapsed && <span>Collapse navigation</span>}
      </button>
      <nav id="home-navigation" aria-label="Main navigation" className="ht-sidebar-items">
        {isDemoWorkspaceUser(user?.email) && item('activity', 'Operations', '/operations')}
        {item('dashboard', 'Dashboard', '/dashboard')}
        {hasPartnerAccess && item('key', 'Partner programmes', '/partner-programmes')}
        {item('home', 'Property profile', '/property-profile')}
        {localManualAskEnabled && item('appliance', 'Appliances', '/appliances')}
        {item('documents', 'Vault', '/documents')}
        {item('note', 'Notebooks', '/saved-notes')}
        {item('grid', 'Tools', '/tools', location.pathname === '/tools' || location.pathname.startsWith('/budget'))}
        <NavItem icon="settings" label="Settings" collapsed={collapsed}
          active={location.pathname.startsWith('/settings')} expanded={settingsOpen} controls="settings-navigation"
          onClick={() => setSettingsOpen(value => !value)} />
        {settingsOpen && <div id="settings-navigation" className="ht-sidebar-settings">
          {item('user', 'Account', '/settings/account')}
          {item('preferences', 'Preferences', '/settings/preferences')}
          {item('notification', 'Notifications', '/settings/notifications')}
          {item('lock', 'Data Privacy', '/settings/data-privacy')}
        </div>}
        {user?.role === 'admin' && (
          <NavItem icon="lock" label="Admin tools"
            collapsed={collapsed} active={location.pathname === '/admin' || location.pathname.startsWith('/admin/')} onClick={() => go('/admin')} />
        )}
      </nav>
    </aside>
  </div>;
}

function NavItem({ icon, label, active, onClick, collapsed, expanded, controls }) {
  return <button type="button" aria-label={label} title={collapsed ? label : undefined}
    aria-current={active && expanded === undefined ? 'page' : undefined}
    aria-expanded={expanded} aria-controls={controls} onClick={onClick}
    className={`ht-nav-item ${active ? 'ht-nav-active' : ''}`}>
    <span className="shrink-0" aria-hidden="true">{icon === "appliance" ? <HTGlyph name="appliance" size={24} /> : <HTIcon name={icon} size={24} assetBase={iconBase} />}</span>
    <span className={collapsed ? 'ht-nav-tooltip' : ''} aria-hidden={collapsed ? 'true' : undefined}>{label}</span>
  </button>;
}
