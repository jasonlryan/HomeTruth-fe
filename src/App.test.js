import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoalEntry from './features/journey/GoalEntry';
import { readJourney } from './features/journey/context';
jest.mock('./context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
beforeEach(() => sessionStorage.clear());
function entry() { return render(<MemoryRouter initialEntries={['/start']}><Routes><Route path="/start" element={<GoalEntry />} /><Route path="/register" element={<h1>Keep your work</h1>} /><Route path="/chat" element={<h1>Guest AskAI</h1>} /></Routes></MemoryRouter>); }
test('management stays a broad goal and retains its intended destination through signup', () => {
  entry(); fireEvent.click(screen.getByRole('button', { name: 'Manage my home' }));
  expect(screen.getByRole('heading', { name: 'Keep your work' })).toBeInTheDocument();
  expect(readJourney('guest')).toMatchObject({ intent: 'manage', returnTo: '/my-home', propertyId: null });
});
test('first-time buyer advice does not require signup, address or documents', () => {
  entry(); fireEvent.click(screen.getByRole('button', { name: 'Ask about buying' }));
  expect(screen.getByRole('heading', { name: 'Guest AskAI' })).toBeInTheDocument();
  expect(readJourney('guest')).toMatchObject({ intent: 'buy', propertyId: null });
});
test('open question crosses to AskAI in a tab draft rather than a URL', () => {
  entry(); fireEvent.change(screen.getByLabelText('Your question'), { target: { value: 'What should I ask at a viewing?' } });
  fireEvent.click(screen.getByRole('button', { name: 'AskAI' }));
  expect(readJourney('guest').question).toBe('What should I ask at a viewing?');
});
