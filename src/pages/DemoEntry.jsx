import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demoReturnTo, localMayaEntry, mayaHomeDestination, startDemoSession } from '../utils/demoEntry';
import '../components/workspace.css';

export default function DemoEntry() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!localMayaEntry()) { navigate('/login', { replace: true }); return; }
    const params = new URLSearchParams(window.location.search);
    const target = params.get('to');
    const explicit = demoReturnTo(params.get('returnTo'));
    startDemoSession().then(({ token, user }) => {
      const destination = explicit || (target === 'appliances' ? '/appliances'
        : target === 'home-record' ? '/property-profile'
        : mayaHomeDestination(user) || '/property-profile');
      login(token, user);
      navigate(destination, { replace: true });
    }).catch(err => setError(err.message));
  }, [login, navigate]);
  return <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 font-brand">
    <h1 className="text-xl font-semibold text-gray-900">Opening Maya’s workspace</h1>
    <p role="status">{error || 'Getting your home record ready…'}</p>
    {error && <button className="ht-workspace-primary" onClick={() => window.location.reload()}>Try again</button>}
    <a className="ht-workspace-link" href="/login">Go to sign in</a>
  </main>;
}
