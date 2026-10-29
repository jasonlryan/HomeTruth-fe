import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthenticatedLayout from './AuthenticatedLayout';
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: {id:1,role:'user'} }) }));
jest.mock('../api/api', () => ({ recordPilotDailyActivity: () => Promise.resolve() }));
jest.mock('../components/Sidebar', () => () => <nav aria-label="Persistent app navigation" />);
jest.mock('../components/Topbar', () => () => <header>AskAI entry</header>);
jest.mock('../components/Footer', () => () => null);
test('stale onboarding flags cannot hide navigation or replace the chosen task', () => {
  for (const key of ['require_profile','new_user','quiz_modal_active','onboarding_lock']) localStorage.setItem(key,'true');
  render(<MemoryRouter initialEntries={['/welcome']}><Routes><Route element={<AuthenticatedLayout />}><Route path="/welcome" element={<h1>Goal selection</h1>} /></Route></Routes></MemoryRouter>);
  expect(screen.getByRole('navigation',{name:'Persistent app navigation'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Goal selection'})).toBeInTheDocument();
  expect(screen.getByText('AskAI entry')).toBeInTheDocument(); localStorage.clear();
});
