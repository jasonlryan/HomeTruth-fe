import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import { claimGuestSession, loginUser } from '../api/api';
import { readJourney, writeJourney } from '../features/journey/context';
jest.mock('../api/api', () => ({ loginUser: jest.fn(), claimGuestSession: jest.fn() }));
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ login: jest.fn() }) }));
jest.mock('../components/Footer', () => () => null);
function Destination() { const location = useLocation(); return <h1>{location.pathname}{location.state?.conversationId ? ' claimed conversation' : ''}</h1>; }
function loginAt(query='') { render(<MemoryRouter initialEntries={['/login'+query]}><Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Destination />} /></Routes></MemoryRouter>); fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } }); fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Test123' } }); fireEvent.click(screen.getByRole('button', { name: /^sign in$/i })); }
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); jest.clearAllMocks(); loginUser.mockResolvedValue({data:{ token:'test-token',user:{ id:1,role:'user',first_name:'A',last_name:'B' } }}); });
test('new-user flag does not override the requested task; guest draft becomes account-scoped', async () => {
  localStorage.setItem('new_user','true'); writeJourney('guest',{intent:'manage',returnTo:'/my-home/value'}); loginAt('?redirect=%2Fmy-home%2Fvalue');
  expect(await screen.findByRole('heading',{name:'/my-home/value'})).toBeInTheDocument(); expect(readJourney('1').intent).toBe('manage');
});
test('partner invitation retains priority over the ordinary task', async () => {
  loginAt('?partner_invite=invited&redirect=%2Fmy-home'); expect(await screen.findByRole('heading',{name:'/partner/invited'})).toBeInTheDocument();
});
test('guest conversation is claimed before opening signed-in chat', async () => {
  claimGuestSession.mockResolvedValue({conversation_id:123}); loginAt('?guest_session_id=guest-1&redirect=%2Fask-ai');
  expect(await screen.findByRole('heading',{name:'/ask-ai claimed conversation'})).toBeInTheDocument(); expect(claimGuestSession).toHaveBeenCalledWith('guest-1');
});
test('failed guest claim still opens AskAI rather than quiz or reset', async () => {
  const warn = jest.spyOn(console,'warn').mockImplementation(()=>{}); claimGuestSession.mockRejectedValue(new Error('offline')); loginAt('?guest_session_id=guest-1&redirect=%2Fask-ai');
  await waitFor(()=>expect(screen.getByRole('heading',{name:'/ask-ai'})).toBeInTheDocument()); warn.mockRestore();
});
