import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { readJourney, writeJourney } from '../features/journey/context';
function Controls() { const {logout} = useAuth(); return <button onClick={logout}>End session</button>; }
test('logout clears tab drafts, identity and guest-conversation material before another account uses the app', () => {
  localStorage.clear(); sessionStorage.clear(); localStorage.setItem('userId','old-user');
  writeJourney('old-user',{intent:'manage',propertyId:42,question:'Private question'});
  sessionStorage.setItem('guest_chat_messages_to_restore','private transcript');
  sessionStorage.setItem('guest_session_id_redirect','old-session');
  render(<AuthProvider><Controls /></AuthProvider>); fireEvent.click(screen.getByRole('button',{name:'End session'}));
  expect(localStorage.getItem('userId')).toBeNull(); expect(readJourney('old-user')).toBeNull();
  expect(sessionStorage.getItem('guest_chat_messages_to_restore')).toBeNull();
  expect(sessionStorage.getItem('guest_session_id_redirect')).toBeNull();
});
