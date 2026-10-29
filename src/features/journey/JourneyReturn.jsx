import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GOAL_LABELS, HOME_DESTINATIONS, goalHome, journeyOwner, readJourney } from './context';
import './Journey.css';
export default function JourneyReturn() {
  const { user } = useAuth();
  const location = useLocation();
  const draft = readJourney(journeyOwner(user));
  if (!draft || location.pathname === '/welcome' || location.pathname.startsWith('/my-home') || location.pathname.startsWith('/settings/')) return null;
  const destination = !user ? '/start' : draft.returnTo !== location.pathname && draft.returnTo !== '/ask-ai'
    ? draft.returnTo : goalHome(draft.intent);
  const destinationLabel = HOME_DESTINATIONS.find(item => item.path === destination)?.label.toLowerCase()
    || ({ '/my-home': 'home overview', '/start': 'goal selection', '/buying': 'buying workspace', '/selling': 'selling workspace', '/dashboard': 'dashboard', '/property-profile': 'home details' })[destination] || 'your task';
  return <div className="journey-return"><span>{GOAL_LABELS[draft.intent]}</span><Link className="journey-link" to={destination}>Return to {destinationLabel}</Link><Link className="journey-link" to="/start">Change my goal</Link>{location.pathname === '/documents' && <span>Document library: all your authorised account documents.</span>}</div>;
}
