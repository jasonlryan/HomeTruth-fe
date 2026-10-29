import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JourneyReturn from './JourneyReturn';
import { writeJourney } from './context';
jest.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: {id:1} }) }));
test('return label and destination match the originating task, not just its goal', () => {
  sessionStorage.clear(); writeJourney('1',{intent:'manage',returnTo:'/my-home/maintenance'});
  render(<MemoryRouter initialEntries={['/ask-ai']}><JourneyReturn /></MemoryRouter>);
  expect(screen.getByRole('link',{name:'Return to maintenance and repairs'})).toHaveAttribute('href','/my-home/maintenance');
});
